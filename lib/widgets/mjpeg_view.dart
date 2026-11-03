import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'mjpeg_web_stub.dart' if (dart.library.js_interop) 'mjpeg_web.dart';

/// Raspberry Pi-এর Flask server থেকে আসা MJPEG লাইভ stream দেখায়।
/// সংযোগ বিচ্ছিন্ন হলে ৩ সেকেন্ড পর নিজে থেকে আবার connect করে।
class MjpegView extends StatefulWidget {
  final String url;
  const MjpegView({super.key, required this.url});

  @override
  State<MjpegView> createState() => _MjpegViewState();
}

class _MjpegViewState extends State<MjpegView> {
  Uint8List? _frame;
  String? _error;
  http.Client? _client;
  StreamSubscription<List<int>>? _sub;
  Timer? _retry;
  bool _disposed = false;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  @override
  void didUpdateWidget(MjpegView old) {
    super.didUpdateWidget(old);
    if (old.url != widget.url) {
      _frame = null;
      _connect();
    }
  }

  void _close() {
    _retry?.cancel();
    _sub?.cancel();
    _client?.close();
    _sub = null;
    _client = null;
  }

  Future<void> _connect() async {
    _close();
    if (kIsWeb) return; // web-এ browser নিজেই <img> দিয়ে MJPEG দেখায়
    final client = http.Client();
    _client = client;
    try {
      final res = await client
          .send(http.Request('GET', Uri.parse(widget.url)))
          .timeout(const Duration(seconds: 8));
      if (res.statusCode != 200) throw Exception('HTTP ${res.statusCode}');
      if (_disposed || _client != client) return;

      final buf = <int>[];
      _sub = res.stream.listen(
        (chunk) {
          buf.addAll(chunk);
          _extractFrames(buf);
        },
        onError: (e) => _fail(e),
        onDone: () => _fail('Stream বন্ধ হয়ে গেছে'),
        cancelOnError: true,
      );
    } catch (e) {
      if (_client == client) _fail(e);
    }
  }

  /// buffer থেকে JPEG (FFD8 ... FFD9) frame বের করে।
  void _extractFrames(List<int> buf) {
    Uint8List? latest;
    while (true) {
      final start = _indexOf(buf, 0xD8, 0);
      if (start < 0) {
        if (buf.length > 1) buf.removeRange(0, buf.length - 1);
        break;
      }
      final end = _indexOf(buf, 0xD9, start + 2);
      if (end < 0) {
        if (start > 0) buf.removeRange(0, start);
        break;
      }
      latest = Uint8List.fromList(buf.sublist(start, end + 2));
      buf.removeRange(0, end + 2);
    }
    if (latest != null && mounted) {
      setState(() {
        _frame = latest;
        _error = null;
      });
    }
  }

  int _indexOf(List<int> b, int marker, int from) {
    for (var i = from; i < b.length - 1; i++) {
      if (b[i] == 0xFF && b[i + 1] == marker) return i;
    }
    return -1;
  }

  void _fail(Object e) {
    if (_disposed) return;
    setState(() => _error = e.toString());
    _retry?.cancel();
    _retry = Timer(const Duration(seconds: 3), _connect);
  }

  @override
  void dispose() {
    _disposed = true;
    _close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (kIsWeb) return buildWebMjpeg(widget.url);
    if (_frame != null) {
      return Stack(
        fit: StackFit.expand,
        children: [
          Image.memory(_frame!, gaplessPlayback: true, fit: BoxFit.contain),
          if (_error != null)
            const Positioned(
              top: 8,
              right: 8,
              child: Chip(label: Text('পুনরায় সংযোগ হচ্ছে...')),
            ),
        ],
      );
    }
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_error == null)
            const CircularProgressIndicator(color: Colors.white)
          else
            const Icon(Icons.videocam_off, color: Colors.white70, size: 48),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              _error == null ? 'ক্যামেরার সাথে সংযোগ হচ্ছে...' : 'সংযোগ পাওয়া যায়নি\n${widget.url}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }
}
