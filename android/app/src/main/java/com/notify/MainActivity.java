package com.notify;

import android.content.Context;
import android.content.Intent;

import com.facebook.react.ReactActivity;
import android.util.Log;

public class MainActivity extends ReactActivity {

  private static String TAG = "NotifyMainActivity";

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Notify";
  }

  @Override
  public void onStart() {
      super.onStart();
      Context context = getApplicationContext();
      if(!HeartbeatService.ISRUNNING) {
          context.startService(new Intent(context, HeartbeatService.class));
      }

  }

  // SERVICE DEFINITIONS HERE
  // @Override
  // public void onResume() {
  // Context context = getApplicationContext();
  // context.stopService(new Intent(context, DataService.class));
  // Log.i(TAG, "Stopping Listener...");
  // super.onStart();

  // }

  // @Override
  // public void onPause() {
  // super.onStop();
  // Context context = getApplicationContext();
  // context.startService(new Intent(context, DataService.class));
  // HeadlessJsTaskService.acquireWakeLockNow(context);
  // Log.i(TAG, "Starting Listener...");
  // }

  // }

  // @Override
  // public void onResume() {
  // Context context = getApplicationContext();
  // context.startService(new Intent(context, ListenerService.class));
  // super.onStart();

  // }

  // @Override
  // public void onPause() {
  // super.onStop();
  // Context context = getApplicationContext();
  // context.stopService(new Intent(context, ListenerService.class));
  // }

}