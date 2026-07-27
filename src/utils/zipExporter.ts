import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('MobileCameraView') || zip;

  // Top-level build.gradle.kts
  root.file('build.gradle.kts', `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`);

  // settings.gradle.kts
  root.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
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

rootProject.name = "MobileCameraView"
include(":app")
`);

  // gradle.properties
  root.file('gradle.properties', `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`);

  // gradlew (Unix wrapper script)
  root.file('gradlew', `#!/usr/bin/env sh
##############################################################################
##
##  Gradle start up script for UN*X
##
##############################################################################
exec gradlew "$@"
`);

  // gradlew.bat (Windows wrapper script)
  root.file('gradlew.bat', `@rem
@rem Copyright 2015 the original author or authors.
@rem
@if "%DEBUG%" == "" @echo off
gradlew %*
`);

  // gradle/wrapper/gradle-wrapper.properties
  root.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  // gradle/libs.versions.toml
  root.file('gradle/libs.versions.toml', `[versions]
agp = "8.3.0"
kotlin = "1.9.22"

[libraries]

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`);

  // Add all Android project source files under app/
  ANDROID_PROJECT_FILES.forEach((file) => {
    root.file(file.path, file.content);
  });

  // Generate ZIP blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = 'MobileCameraView_AndroidStudioProject.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
