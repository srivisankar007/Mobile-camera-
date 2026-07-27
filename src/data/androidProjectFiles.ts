import { AndroidFile } from '../types/android';

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    id: 'manifest',
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'System permissions (SYSTEM_ALERT_WINDOW), Foreground Service, and Activity declarations.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.example.mobilecamera">

    <!-- 1. SYSTEM_ALERT_WINDOW permission for Chat-Head overlay -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- 2. Foreground Service permission -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE"
        tools:targetApi="34" />

    <!-- 3. Vibration feedback permission -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- 4. Auto-start on system boot permission -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- 5. Notification permission for Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MobileCameraView"
        tools:targetApi="34">

        <!-- Main Launcher Activity -->
        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.MobileCameraView">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Full-screen Image Viewer Activity -->
        <activity
            android:name=".ui.ImageViewerActivity"
            android:exported="false"
            android:theme="@style/Theme.MobileCameraView.NoActionBar" />

        <!-- Foreground Service managing WindowManager overlay -->
        <service
            android:name=".service.FloatingWidgetService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Floating chat-head widget system overlay for quick media viewing" />
        </service>

        <!-- Receiver to start floating widget automatically after device boot -->
        <receiver
            android:name=".receiver.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`
  },
  {
    id: 'build-gradle-app',
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (App)',
    language: 'groovy',
    category: 'gradle',
    description: 'App level Gradle dependencies (Material 3, Lifecycle, ViewBinding).',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.example.mobilecamera"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.example.mobilecamera"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")

    // Image loading
    implementation("com.github.bumptech.glide:glide:4.16.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}`
  },
  {
    id: 'main-activity',
    path: 'app/src/main/java/com/example/mobilecamera/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Main activity handling overlay permission, service toggle, and navigation.',
    content: `package com.example.mobilecamera.ui

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewmodel.ViewModelProvider
import androidx.appcompat.app.AppCompatActivity
import com.example.mobilecamera.databinding.ActivityMainBinding
import com.example.mobilecamera.service.FloatingWidgetService
import com.example.mobilecamera.viewmodel.WidgetViewModel

/**
 * Main Activity serves as the control hub for MobileCameraView.
 * Handles requesting SYSTEM_ALERT_WINDOW runtime permission and starting the FloatingWidgetService.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: WidgetViewModel

    private val overlayPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) {
        if (checkOverlayPermission()) {
            Toast.makeText(this, "Overlay Permission Granted!", Toast.LENGTH_SHORT).show()
            startFloatingService()
        } else {
            Toast.makeText(this, "Overlay permission is required to display chat head.", Toast.LENGTH_LONG).show()
        }
        updateUiState()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = ViewModelProvider(this)[WidgetViewModel::class.java]

        setupClickListeners()
        observeViewModel()
    }

    override fun onResume() {
        super.onResume()
        updateUiState()
    }

    private fun setupClickListeners() {
        binding.btnGrantPermission.setOnClickListener {
            requestOverlayPermission()
        }

        binding.btnStartWidget.setOnClickListener {
            if (!checkOverlayPermission()) {
                requestOverlayPermission()
            } else {
                startFloatingService()
            }
        }

        binding.btnStopWidget.setOnClickListener {
            stopFloatingService()
        }

        binding.btnViewImage.setOnClickListener {
            startActivity(Intent(this, ImageViewerActivity::class.java))
        }
    }

    private fun observeViewModel() {
        viewModel.isWidgetRunning.observe(this) { isRunning ->
            binding.tvServiceStatus.text = if (isRunning) "Status: Service Active" else "Status: Stopped"
            binding.btnStartWidget.isEnabled = !isRunning
            binding.btnStopWidget.isEnabled = isRunning
        }
    }

    private fun checkOverlayPermission(): Boolean {
        return Settings.canDrawOverlays(this)
    }

    private fun requestOverlayPermission() {
        if (!checkOverlayPermission()) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            overlayPermissionLauncher.launch(intent)
        }
    }

    private fun startFloatingService() {
        val serviceIntent = Intent(this, FloatingWidgetService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }
        viewModel.setWidgetRunning(true)
    }

    private fun stopFloatingService() {
        val serviceIntent = Intent(this, FloatingWidgetService::class.java)
        stopService(serviceIntent)
        viewModel.setWidgetRunning(false)
    }

    private fun updateUiState() {
        val hasOverlay = checkOverlayPermission()
        binding.cardPermissionWarning.visibility = if (hasOverlay) android.view.View.GONE else android.view.View.VISIBLE
        binding.btnStartWidget.isEnabled = hasOverlay
    }
}`
  },
  {
    id: 'image-viewer-activity',
    path: 'app/src/main/java/com/example/mobilecamera/ui/ImageViewerActivity.kt',
    name: 'ImageViewerActivity.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Displays the bundled image from res/drawable in full screen when tapping the floating widget.',
    content: `package com.example.mobilecamera.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.mobilecamera.R
import com.example.mobilecamera.databinding.ActivityImageViewerBinding

/**
 * Full-screen ImageViewerActivity displaying the bundled image in full view.
 * Opened when tapping the floating widget chat head.
 */
class ImageViewerActivity : AppCompatActivity() {

    private lateinit var binding: ActivityImageViewerBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityImageViewerBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Load bundled image from res/drawable/sample_image
        binding.imageViewFull.setImageResource(R.drawable.sample_image)

        binding.btnClose.setOnClickListener {
            finish()
        }
    }
}`
  },
  {
    id: 'floating-service',
    path: 'app/src/main/java/com/example/mobilecamera/service/FloatingWidgetService.kt',
    name: 'FloatingWidgetService.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'Foreground Service maintaining WindowManager overlay, drag gestures, magnetic snapping, and SharedPreferences persistence.',
    content: `package com.example.mobilecamera.service

import android.animation.ValueAnimator
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.graphics.Point
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.OvershootInterpolator
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import com.example.mobilecamera.R
import com.example.mobilecamera.preference.WidgetPreferences
import com.example.mobilecamera.ui.ImageViewerActivity
import com.example.mobilecamera.ui.MainActivity

/**
 * Foreground Service managing the floating chat-head overlay view on screen using WindowManager.
 * Stores last widget position into SharedPreferences upon drag completion.
 * Opens ImageViewerActivity on tap.
 */
class FloatingWidgetService : Service() {

    private lateinit var windowManager: WindowManager
    private var floatingView: View? = null
    private lateinit var params: WindowManager.LayoutParams
    private lateinit var preferences: WidgetPreferences

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var lastTapTime: Long = 0

    companion object {
        private const val CHANNEL_ID = "mobile_camera_overlay_channel"
        private const val NOTIFICATION_ID = 2001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        preferences = WidgetPreferences(this)
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        startForegroundServiceNotification()
        createFloatingWidgetView()
    }

    private fun startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "MobileCameraView Floating Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }

        val openAppIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Floating Widget Active")
            .setContentText("MobileCameraView overlay is running over other apps.")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun createFloatingWidgetView() {
        val layoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        floatingView = layoutInflater.inflate(R.layout.layout_floating_widget, null)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        // Restore remembered position from SharedPreferences
        val savedX = preferences.getWidgetX()
        val savedY = preferences.getWidgetY()

        params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = savedX
            y = savedY
        }

        windowManager.addView(floatingView, params)

        val imgAvatar = floatingView?.findViewById<ImageView>(R.id.imgWidgetAvatar)
        val btnClose = floatingView?.findViewById<ImageView>(R.id.btnWidgetClose)

        btnClose?.setOnClickListener {
            stopSelf()
        }

        floatingView?.setOnTouchListener(object : View.OnTouchListener {
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
                        val deltaX = (event.rawX - initialTouchX).toInt()
                        val deltaY = (event.rawY - initialTouchY).toInt()

                        // Save position in SharedPreferences
                        preferences.saveWidgetPosition(params.x, params.y)

                        if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                            openImageViewer()
                        } else {
                            snapToNearestEdge()
                        }
                        return true
                    }
                }
                return false
            }
        })
    }

    private fun openImageViewer() {
        val intent = Intent(this, ImageViewerActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        startActivity(intent)
    }

    private fun snapToNearestEdge() {
        val display = windowManager.defaultDisplay
        val size = Point()
        display.getSize(size)
        val screenWidth = size.x

        val targetX = if (params.x + (floatingView?.width ?: 0) / 2 < screenWidth / 2) {
            20
        } else {
            screenWidth - (floatingView?.width ?: 150) - 20
        }

        val animator = ValueAnimator.ofInt(params.x, targetX)
        animator.duration = 250
        animator.interpolator = OvershootInterpolator()
        animator.addUpdateListener { animation ->
            params.x = animation.animatedValue as Int
            try {
                windowManager.updateViewLayout(floatingView, params)
                preferences.saveWidgetPosition(params.x, params.y)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        animator.start()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (floatingView != null) {
            try {
                windowManager.removeView(floatingView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}`
  },
  {
    id: 'boot-receiver',
    path: 'app/src/main/java/com/example/mobilecamera/receiver/BootReceiver.kt',
    name: 'BootReceiver.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'BroadcastReceiver starting the floating widget service after device reboot.',
    content: `package com.example.mobilecamera.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.example.mobilecamera.service.FloatingWidgetService

/**
 * Receiver automatically booting the floating widget Foreground Service after system restart.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            if (Settings.canDrawOverlays(context)) {
                val serviceIntent = Intent(context, FloatingWidgetService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}`
  },
  {
    id: 'widget-preferences',
    path: 'app/src/main/java/com/example/mobilecamera/preference/WidgetPreferences.kt',
    name: 'WidgetPreferences.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'SharedPreferences helper persisting widget positions and options.',
    content: `package com.example.mobilecamera.preference

import android.content.Context
import android.content.SharedPreferences

/**
 * SharedPreferences helper storing and retrieving floating widget screen coordinates.
 */
class WidgetPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("mobile_camera_prefs", Context.MODE_PRIVATE)

    fun saveWidgetPosition(x: Int, y: Int) {
        prefs.edit().putInt("KEY_POS_X", x).putInt("KEY_POS_Y", y).apply()
    }

    fun getWidgetX(): Int = prefs.getInt("KEY_POS_X", 30)

    fun getWidgetY(): Int = prefs.getInt("KEY_POS_Y", 140)
}`
  },
  {
    id: 'widget-viewmodel',
    path: 'app/src/main/java/com/example/mobilecamera/viewmodel/WidgetViewModel.kt',
    name: 'WidgetViewModel.kt',
    language: 'kotlin',
    category: 'kotlin',
    description: 'MVVM ViewModel managing Floating Widget service active status state.',
    content: `package com.example.mobilecamera.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

/**
 * ViewModel managing Floating Widget service state.
 */
class WidgetViewModel : ViewModel() {

    private val _isWidgetRunning = MutableLiveData<Boolean>(false)
    val isWidgetRunning: LiveData<Boolean> = _isWidgetRunning

    fun setWidgetRunning(running: Boolean) {
        _isWidgetRunning.value = running
    }
}`
  },
  {
    id: 'layout-main',
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    language: 'xml',
    category: 'layout',
    description: 'Material 3 Main Activity UI layout with permission banner and widget action controls.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="20dp"
    android:background="#F8FAFC">

    <!-- Title Card -->
    <com.google.android.material.card.MaterialCardView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:cardCornerRadius="16dp"
        app:cardElevation="2dp"
        app:cardBackgroundColor="#FFFFFF"
        android:layout_marginBottom="16dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="MobileCameraView"
                android:textSize="22sp"
                android:textStyle="bold"
                android:textColor="#0F172A" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Chat-Head Style System Overlay Control Hub"
                android:textSize="13sp"
                android:textColor="#64748B"
                android:layout_marginTop="4dp" />

            <TextView
                android:id="@+id/tvServiceStatus"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Status: Stopped"
                android:textSize="12sp"
                android:textStyle="bold"
                android:textColor="#4F46E5"
                android:layout_marginTop="8dp" />
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- Permission Warning Card -->
    <com.google.android.material.card.MaterialCardView
        android:id="@+id/cardPermissionWarning"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:cardCornerRadius="16dp"
        app:cardElevation="1dp"
        app:cardBackgroundColor="#FEF2F2"
        android:layout_marginBottom="16dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Overlay Permission Required"
                android:textSize="15sp"
                android:textStyle="bold"
                android:textColor="#991B1B" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Enable 'Display over other apps' to allow the chat-head floating widget."
                android:textSize="12sp"
                android:textColor="#7F1D1D"
                android:layout_marginTop="4dp"
                android:layout_marginBottom="12dp" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnGrantPermission"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Grant Overlay Permission"
                app:backgroundTint="#DC2626" />
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

    <!-- Controls Card -->
    <com.google.android.material.card.MaterialCardView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        app:cardCornerRadius="16dp"
        app:cardElevation="2dp"
        app:cardBackgroundColor="#FFFFFF">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnStartWidget"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Start Floating Widget"
                app:cornerRadius="12dp"
                app:backgroundTint="#4F46E5" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnStopWidget"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Stop Floating Widget"
                style="@style/Widget.Material3.Button.OutlinedButton"
                app:cornerRadius="12dp"
                android:layout_marginTop="8dp" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnViewImage"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Open Fullscreen Image Viewer"
                style="@style/Widget.Material3.Button.TonalButton"
                app:cornerRadius="12dp"
                android:layout_marginTop="8dp" />
        </LinearLayout>
    </com.google.android.material.card.MaterialCardView>

</LinearLayout>`
  },
  {
    id: 'layout-image-viewer',
    path: 'app/src/main/res/layout/activity_image_viewer.xml',
    name: 'activity_image_viewer.xml',
    language: 'xml',
    category: 'layout',
    description: 'Full screen image viewer displaying bundled res/drawable image.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000">

    <ImageView
        android:id="@+id/imageViewFull"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:scaleType="fitCenter"
        android:src="@drawable/sample_image"
        android:contentDescription="Full Screen Image" />

    <ImageButton
        android:id="@+id/btnClose"
        android:layout_width="48dp"
        android:layout_height="48dp"
        android:layout_alignParentTop="true"
        android:layout_alignParentEnd="true"
        android:layout_margin="16dp"
        android:background="#80000000"
        android:src="@android:drawable/ic_menu_close_clear_cancel"
        android:contentDescription="Close Image Viewer" />

</RelativeLayout>`
  },
  {
    id: 'layout-floating-widget',
    path: 'app/src/main/res/layout/layout_floating_widget.xml',
    name: 'layout_floating_widget.xml',
    language: 'xml',
    category: 'layout',
    description: 'Layout for the floating chat-head bubble overlay.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content">

    <ImageView
        android:id="@+id/imgWidgetAvatar"
        android:layout_width="64dp"
        android:layout_height="64dp"
        android:src="@drawable/sample_image"
        android:scaleType="centerCrop"
        android:background="@drawable/shape_circle_border"
        android:padding="2dp" />

    <ImageView
        android:id="@+id/btnWidgetClose"
        android:layout_width="20dp"
        android:layout_height="20dp"
        android:layout_gravity="top|end"
        android:src="@android:drawable/ic_menu_close_clear_cancel"
        android:background="#DC2626"
        android:padding="2dp" />

</FrameLayout>`
  },
  {
    id: 'sample-image-drawable',
    path: 'app/src/main/res/drawable/sample_image.xml',
    name: 'sample_image.xml',
    language: 'xml',
    category: 'layout',
    description: 'Vector drawable representing the bundled photo displayed in full screen.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="400dp"
    android:height="400dp"
    android:viewportWidth="400"
    android:viewportHeight="400">
  <path
      android:pathData="M0,0h400v400h-400z"
      android:fillColor="#1E1B4B"/>
  <path
      android:pathData="M200,200m-120,0a120,120 0,1 1,240 0a120,120 0,1 1,-240 0"
      android:fillColor="#4F46E5"/>
  <path
      android:pathData="M200,160m-40,0a40,40 0,1 1,80 0a40,40 0,1 1,-80 0"
      android:fillColor="#818CF8"/>
  <path
      android:pathData="M200,280c-50,0 -90,-30 -90,-50h180c0,20 -40,50 -90,50z"
      android:fillColor="#C7D2FE"/>
</vector>`
  },
  {
    id: 'shape-circle-border',
    path: 'app/src/main/res/drawable/shape_circle_border.xml',
    name: 'shape_circle_border.xml',
    language: 'xml',
    category: 'layout',
    description: 'Circle background shape with accent border for chat-head widget.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <solid android:color="#4F46E5" />
    <stroke
        android:width="2dp"
        android:color="#FFFFFF" />
</shape>`
  },
  {
    id: 'strings-xml',
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    language: 'xml',
    category: 'values',
    description: 'App strings and localized titles.',
    content: `<resources>
    <string name="app_name">MobileCameraView</string>
</resources>`
  }
];
