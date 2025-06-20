package com.recipenote;

import android.Manifest;
import android.content.pm.PackageManager;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected void onStart() {
    super.onStart();
//    checkForPermissions();
  }

  void checkForPermissions()
  {
    // Here, thisActivity is the current activity
    if (ContextCompat.checkSelfPermission(this,
            Manifest.permission.WRITE_EXTERNAL_STORAGE)
            != PackageManager.PERMISSION_GRANTED) {

      // Permission is not granted
      // Should we show an explanation?
      if (ActivityCompat.shouldShowRequestPermissionRationale(this,
              Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
        // Show an explanation to the user *asynchronously* -- don't block
        // this thread waiting for the user's response! After the user
        // sees the explanation, try again to request the permission.
        // This part I didn't implement,because for my case it isn't needed
//        Log.i(TAG,"Unexpected flow");
      } else {
        // No explanation needed; request the permission
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                0);

        // MY_PERMISSIONS_REQUEST_EXTERNAL_STORAGE is an
        // app-defined int constant. The callback method gets the
        // result of the request.
      }
    } else {
      // Permission is already granted, call the function that does what you need

      onFileWritePermissionGranted();
    }
  }

  void onFileWritePermissionGranted () {

  }

  @Override
  protected String getMainComponentName() {
    return "RecipeNote";
  }

  @Override
  public void onRequestPermissionsResult(int requestCode,
                                         String[] permissions, int[] grantResults) {
    switch (requestCode) {
      case 0: {
        // If request is cancelled, the result arrays are empty.
        if (grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
          // permission was granted, yay!
          // call the function that does what you need
          onFileWritePermissionGranted();
        } else {
//          Log.e(TAG, "Write permissions has to be granted tp ATMS, otherwise it cannot operate properly.\n Exiting the program...\n");
        }
        return;
      }

      // other 'case' lines to check for other
      // permissions this app might request.
    }
  }
}
