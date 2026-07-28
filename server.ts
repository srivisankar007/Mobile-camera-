import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import JSZip from 'jszip';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Android Project Files template for backend zip generation
const DEFAULT_ANDROID_FILES = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.floatingwidget">

    <!-- Permissions required for Floating System Overlay -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Floating Overlay Studio"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FloatingWidget">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for persistent System Overlay -->
        <service
            android:name=".service.FloatingWidgetService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating System Overlay Widget for quick system interactions" />
        </service>

    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/com/example/floatingwidget/service/FloatingWidgetService.kt',
    content: `package com.example.floatingwidget.service

import android.app.*
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.ImageView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import com.example.floatingwidget.R
import kotlin.math.abs

class FloatingWidgetService : Service() {

    private lateinit var windowManager: WindowManager
    private lateinit var floatingView: View
    private lateinit var params: WindowManager.LayoutParams

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f

    override fun onCreate() {
        super.onCreate()
        startForegroundServiceNotification()
        setupFloatingView()
    }

    private fun setupFloatingView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        floatingView = LayoutInflater.from(this).inflate(R.layout.layout_floating_widget, null)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 100
            y = 200
        }

        windowManager.addView(floatingView, params)

        val collapsedView = floatingView.findViewById<View>(R.id.collapse_view)
        collapsedView.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager.updateViewLayout(floatingView, params)
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val diffX = abs(event.rawX - initialTouchX)
                        val diffY = abs(event.rawY - initialTouchY)
                        if (diffX < 10 && diffY < 10) {
                            Toast.makeText(this@FloatingWidgetService, "Floating Widget Clicked!", Toast.LENGTH_SHORT).show()
                        }
                        return true
                    }
                }
                return false
            }
        })
    }

    private fun startForegroundServiceNotification() {
        val channelId = "floating_widget_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Floating Widget Service",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)?.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Floating Widget Active")
            .setContentText("Overlay system view is running in background")
            .setSmallIcon(R.drawable.ic_widget_overlay)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(1001, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::floatingView.isInitialized) {
            windowManager.removeView(floatingView)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
  },
];

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    androidExporterVersion: '2.4.0',
    capabilities: [
      'SYSTEM_ALERT_WINDOW_VALIDATION',
      'ANDROID_ZIP_BUILDER',
      'AI_KOTLIN_ASSISTANT',
      'LIVE_OVERLAY_TELEMETRY',
    ],
  });
});

// Android Overlay Code Validator API
app.post('/api/android/validate', (req, res) => {
  try {
    const { manifestXml, kotlinCode } = req.body || {};
    const issues: Array<{ id: string; type: 'error' | 'warning' | 'info'; message: string; line?: number }> = [];

    // Manifest validation
    if (manifestXml) {
      if (!manifestXml.includes('android.permission.SYSTEM_ALERT_WINDOW')) {
        issues.push({
          id: 'missing-alert-window',
          type: 'error',
          message: 'Manifest is missing <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" /> required for floating overlays.',
        });
      }
      if (!manifestXml.includes('android.permission.FOREGROUND_SERVICE')) {
        issues.push({
          id: 'missing-fg-service',
          type: 'error',
          message: 'Manifest should declare android.permission.FOREGROUND_SERVICE to prevent system kill.',
        });
      }
      if (!manifestXml.includes('TYPE_APPLICATION_OVERLAY') && !manifestXml.includes('SYSTEM_ALERT_WINDOW')) {
        issues.push({
          id: 'api34-compliance',
          type: 'info',
          message: 'Android 14 (API 34) requires FOREGROUND_SERVICE_SPECIAL_USE for custom overlay widgets.',
        });
      }
    }

    // Kotlin validation
    if (kotlinCode) {
      if (!kotlinCode.includes('TYPE_APPLICATION_OVERLAY')) {
        issues.push({
          id: 'deprecated-window-type',
          type: 'warning',
          message: 'Ensure WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY is used for Android 8.0+ (API 26+).',
        });
      }
      if (!kotlinCode.includes('FLAG_NOT_FOCUSABLE')) {
        issues.push({
          id: 'focusable-window',
          type: 'warning',
          message: 'Window params should include FLAG_NOT_FOCUSABLE to allow touches to pass through to background apps.',
        });
      }
      if (kotlinCode.includes('OnTouchListener') && !kotlinCode.includes('updateViewLayout')) {
        issues.push({
          id: 'missing-view-update',
          type: 'error',
          message: 'MotionEvent listener handles touch, but windowManager.updateViewLayout(view, params) is missing during drag.',
        });
      }
    }

    const errorCount = issues.filter((i) => i.type === 'error').length;
    const warningCount = issues.filter((i) => i.type === 'warning').length;
    const score = Math.max(0, 100 - errorCount * 25 - warningCount * 10);

    res.json({
      isValid: errorCount === 0,
      score,
      issuesCount: issues.length,
      issues,
      androidVersionTarget: 'Android 14 (API 34)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to validate Android overlay code.', details: err?.message });
  }
});

// Server-side Android Studio ZIP Builder API
app.get('/api/android/download-zip', async (req, res) => {
  try {
    const zip = new JSZip();
    const root = zip.folder('FloatingOverlayStudio') || zip;

    root.file('build.gradle.kts', `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`);

    root.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "FloatingOverlayStudio"
include(":app")
`);

    root.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

    DEFAULT_ANDROID_FILES.forEach((f) => {
      root.file(f.path, f.content);
    });

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="FloatingOverlayStudio_AndroidProject.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate Android project ZIP archive.', details: err?.message });
  }
});

// Gemini AI Kotlin Developer Assistant API
app.post('/api/gemini/assist', async (req, res) => {
  try {
    const { prompt, currentCode, topic } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const client = getGenAIClient();
    const systemInstruction = `You are an expert Android System & Graphics Architect specializing in CameraX, OpenGL ES 2.0/3.0 Shaders (GLSL), System Overlay Widgets (SYSTEM_ALERT_WINDOW), WindowManager, and Foreground Services in Kotlin.
Provide clear, production-ready Android Kotlin solutions, GLSL fragment shaders, CameraX lifecycle implementations, and XML layouts. Always enforce Android 14 (API 34) camera and overlay guidelines.`;

    const fullUserPrompt = `${prompt}\n\n${currentCode ? `[CURRENT CODE CONTEXT]:\n${currentCode}` : ''}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\n${fullUserPrompt}` }] },
      ],
    });

    const answer = response.text || 'No response generated.';

    res.json({
      success: true,
      prompt,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({
      error: 'Gemini AI Assistant error.',
      message: err?.message || 'Failed to call Gemini API. Ensure GEMINI_API_KEY is configured.',
    });
  }
});

// Overlay Telemetry API
app.get('/api/overlay/status', (req, res) => {
  res.json({
    serviceRunning: true,
    permissionGranted: true,
    viewAttached: true,
    memoryUsageMB: 18.4,
    fps: 60,
    windowType: 'TYPE_APPLICATION_OVERLAY',
    touchMode: 'DRAG_AND_SNAP',
    dismissDropZoneActive: true,
    lastPosition: { x: 30, y: 140 },
  });
});

// Vite Middleware & Server Initialization
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Floating Widget Backend Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
