import 'dart:ui_web' as ui_web;

import 'package:flutter/widgets.dart';
import 'package:web/web.dart' as web;

final Set<String> _registered = {};

/// Flutter web (Chrome): browser-এর নিজস্ব <img> MJPEG stream সরাসরি দেখাতে পারে।
Widget buildWebMjpeg(String url) {
  final viewType = 'mjpeg-view-$url';
  if (_registered.add(viewType)) {
    ui_web.platformViewRegistry.registerViewFactory(viewType, (int _) {
      final img = web.HTMLImageElement()..src = url;
      img.style
        ..width = '100%'
        ..height = '100%'
        ..objectFit = 'contain'
        ..backgroundColor = 'black';
      return img;
    });
  }
  return HtmlElementView(key: ValueKey(viewType), viewType: viewType);
}
