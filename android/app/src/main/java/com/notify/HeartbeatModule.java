package com.notify;

import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.app.PendingIntent;
import android.app.NotificationManager;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.R.mipmap;

import android.os.Build;
import android.util.Log;


import org.json.JSONArray;
import org.json.JSONObject;

import javax.annotation.Nonnull;

public class HeartbeatModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Heartbeat";
    public static ReactApplicationContext reactContext;
    private static String TITLE = "Title";
    private static String STATUS = "STOPPED";
    private static boolean DEBUG = false;
    private static HeartbeatModule instance;

    public HeartbeatModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    public static HeartbeatModule getInstance() {
        return instance;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }


    @ReactMethod
    public void notificationPaused() {
        HeartbeatService.getInstance().notificationPaused();
    }

    @ReactMethod
    public void configService(String title) {
        TITLE = title;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    public void sendToNode(String event, String msg) {
        try {
            if (DEBUG) Log.i("HEARTBEAT-MODULE", "msg from react : "+ event);
            HeartbeatService.getInstance().sendMessageToNode(event, msg);
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE",  "sendToNode - " + e.getMessage());
        }

    }


    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    private void get(String key) {
        try {
            if (DEBUG) Log.i("HEARTBEAT-MODULE", "msg from react : "+ key);
            HeartbeatService.getInstance().sendMessageToNode("get", key);
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE", "get - " + e.getMessage());
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    private void getAll(String key) {
        try {
            JSONObject msg = new JSONObject();
            msg.put("key", key);
            HeartbeatService.getInstance().sendMessageToNode("getAll", msg.toString());
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE", "getAll - " + e.getMessage());
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    private void put(String key, String value) {
        try {
            JSONObject msg = new JSONObject();
            msg.put("key", key);
            msg.put("value", value);
            if(DEBUG) Log.d("NODE_DEBUG_STOP", value);
            if(DEBUG) Log.d("NODE_DEBUG_PUT", msg.toString());
            HeartbeatService.getInstance().sendMessageToNode("put", msg.toString());
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE", "put - " + e.getMessage());
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    private void set(String key, String value) {
        try {
            JSONObject msg = new JSONObject();
            msg.put("key", key);
            msg.put("value", value);
            HeartbeatService.getInstance().sendMessageToNode("set", msg.toString());
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE", "set - " + e.getMessage());
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    private void off(String key) {
        try {
            JSONObject msg = new JSONObject();
            msg.put("key", key);
            HeartbeatService.getInstance().sendMessageToNode("set", msg.toString());
        } catch (Exception e) {
            Log.e("HEARTBEAT-MODULE", "set - " + e.getMessage());
        }
    }


    @ReactMethod
    public void getStatus(Callback successCallback) {
        try {
            successCallback.invoke(instance.STATUS);
        } catch (Exception e) {

        }
    }


    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void startTimer() {
        try {
            HeartbeatService.getInstance().sendMessageToNode("start", "");
        } catch (Exception e) {
            // TODO: handle exception
        }

    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void stopTimer() {
        try {
            HeartbeatService.getInstance().sendMessageToNode("stop", "");
        } catch (Exception e) {
            // TODO: handle exception
        }
    }
}