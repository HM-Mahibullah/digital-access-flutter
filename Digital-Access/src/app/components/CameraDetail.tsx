import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Camera as CameraIcon,
  Video,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useState } from 'react';

interface Camera {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  thumbnail: string;
}

interface CameraDetailProps {
  camera: Camera;
  onBack: () => void;
}

export function CameraDetail({ camera, onBack }: CameraDetailProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-medium">{camera.name}</h2>
            <p className="text-xs opacity-90">{camera.location}</p>
          </div>
        </div>
        <button className="p-2">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Video Player */}
      <div className="relative bg-black">
        <img
          src={camera.thumbnail}
          alt={camera.name}
          className="w-full aspect-video object-cover"
        />

        {camera.isOnline && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 px-2 py-1 rounded">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs">LIVE</span>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 px-2 py-1 rounded animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-white text-xs">REC</span>
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {!isPlaying && (
            <button
              onClick={() => setIsPlaying(true)}
              className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
            >
              <Play className="w-12 h-12 text-white fill-white" />
            </button>
          )}
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between text-white">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-2">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button className="p-2">
                <CameraIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 ${isRecording ? 'text-red-500' : ''}`}
              >
                <Video className="w-5 h-5" />
              </button>

              <button className="p-2">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PTZ Controls */}
      <div className="bg-card p-4">
        <h3 className="text-sm mb-3 text-muted-foreground">Pan/Tilt/Zoom Controls</h3>

        <div className="flex gap-6">
          {/* Directional Pad */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-1 max-w-[180px]">
              <div></div>
              <button className="bg-primary/10 hover:bg-primary/20 rounded p-3 flex items-center justify-center">
                <ChevronUp className="w-6 h-6 text-primary" />
              </button>
              <div></div>

              <button className="bg-primary/10 hover:bg-primary/20 rounded p-3 flex items-center justify-center">
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              <button className="bg-primary hover:bg-primary/90 rounded p-3 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
              <button className="bg-primary/10 hover:bg-primary/20 rounded p-3 flex items-center justify-center">
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>

              <div></div>
              <button className="bg-primary/10 hover:bg-primary/20 rounded p-3 flex items-center justify-center">
                <ChevronDown className="w-6 h-6 text-primary" />
              </button>
              <div></div>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex flex-col gap-2">
            <button className="bg-primary/10 hover:bg-primary/20 rounded p-4 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-primary" />
            </button>
            <button className="bg-primary/10 hover:bg-primary/20 rounded p-4 flex items-center justify-center">
              <ZoomOut className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card border-t p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Playback Timeline</h3>
          <span className="text-xs text-muted-foreground">Today, 14:32</span>
        </div>

        <div className="relative h-12 bg-gray-200 rounded overflow-hidden">
          {/* Timeline segments indicating recorded footage */}
          <div className="absolute top-0 left-[10%] h-full w-[15%] bg-primary/60"></div>
          <div className="absolute top-0 left-[30%] h-full w-[25%] bg-primary/60"></div>
          <div className="absolute top-0 left-[60%] h-full w-[20%] bg-primary/60"></div>

          {/* Current position indicator */}
          <div className="absolute top-0 left-[45%] h-full w-0.5 bg-red-500">
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}
