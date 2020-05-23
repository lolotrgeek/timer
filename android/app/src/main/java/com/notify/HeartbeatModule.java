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
import android.widget.Toast;

import javax.annotation.Nonnull;

public class HeartbeatModule extends ReactContextBaseJavaModule {

    public static final String REACT_CLASS = "Heartbeat";
    public static ReactApplicationContext reactContext;
    private static final int SERVICE_NOTIFICATION_ID = 12345;
    private static final String CHANNEL_ID = "HEARTBEAT";
    private static String TITLE = "Title";
    private static String STATUS = "STOPPED";
    private static String COUNT = "PAUSED";
    private static String TICK;
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
    public void notificationPaused(String title) {
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this.reactContext, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent startIntent = new Intent(this.reactContext, HeartbeatActionReceiver.class);
        startIntent.putExtra("ACTION", "start");
        PendingIntent startPendingIntent = PendingIntent.getBroadcast(this.reactContext, 1, startIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Start",
                startPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(title).setContentText(TICK)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_HIGH).setOnlyAlertOnce(true)
                .setOngoing(false).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.reactContext);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());
    }

    @ReactMethod
    public void configService(String title) {
        TITLE = title;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    public void sendToNode(String msg) {
        HeartbeatService.getInstance().sendMessageToNode("React", msg);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    public void get(String msg) {
        HeartbeatService.getInstance().sendMessageToNode("get", msg);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    public void put(String msg) {
        HeartbeatService.getInstance().sendMessageToNode("put", msg);
    }

    @ReactMethod
    public void getStatus(Callback successCallback) {
        try {
            successCallback.invoke(instance.STATUS);
        } catch (Exception e) {

        }
    }

    @ReactMethod
    public void setCountStatus(String status) {
        COUNT = status;
        Toast.makeText(this.reactContext,COUNT,Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public void getCountStatus(Callback successCallback) {
        try {
            successCallback.invoke(instance.COUNT);
        } catch (Exception e) {

        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void startService() {
        instance = this;
        if (STATUS == "STOPPED") {
            try {
                this.reactContext.startForegroundService(new Intent(this.reactContext, HeartbeatService.class).putExtra("TITLE", TITLE)); 
                // this.reactContext.startService(new Intent(this.reactContext, HeartbeatService.class).putExtra("TITLE", TITLE)); 
                STATUS = "STARTED";
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("STATUS", STATUS);
            } catch (Exception e) {
                // TODO: handle exception, consider callback
            }
        }
    }

    @ReactMethod
    public void stopService() {
        if (STATUS == "STARTED") {
            try {
                this.reactContext.stopService(new Intent(this.reactContext, HeartbeatService.class));
                STATUS = "STOPPED";
                this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("STATUS",
                        STATUS);
            } catch (Exception e) {
                // TODO: handle exception, consider callback
            }
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void startAction() {
        if (STATUS == "STOPPED") {
            startService();
        }
        try {
            this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ACTION", "start");
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void stopAction() {
        if (STATUS == "STOPPED") {
            startService();
        }
        try {
            // notificationPaused(TITLE);
            this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("ACTION", "stop");
        } catch (Exception e) {
            // TODO: handle exception
        }
    }
    
    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void resumeCounting() {
        if (STATUS == "STOPPED") {
            startService();
        }
        try {
            HeartbeatService.getInstance().pause(); // want to clear any remaining counters before we resume
            HeartbeatService.getInstance().resume();
            this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("COUNT", "resume");
        } catch (Exception e) {
            // TODO: handle exception
        }

    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void pauseCounting() {
        if (STATUS == "STOPPED") {
            startService();
        }
        try {
            HeartbeatService.getInstance().pause();
            this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("COUNT", "pause");
        } catch (Exception e) {
            // TODO: handle exception
        }
    }

    @ReactMethod
    public void notificationUpdate(int tick, String title) {
        TICK = Integer.toString(tick);
        // send tick event
        this.reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("Heartbeat", tick);
        // set Intent for what happens when tapping notification
        Intent notificationIntent = new Intent(this.reactContext, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this.reactContext, 0, notificationIntent,
                PendingIntent.FLAG_CANCEL_CURRENT);
        // Intend and Build Action Buttons
        Intent actionIntent = new Intent(this.reactContext, HeartbeatActionReceiver.class);
        actionIntent.putExtra("ACTION", "stop");
        PendingIntent actionPendingIntent = PendingIntent.getBroadcast(this.reactContext, 1, actionIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action buttonAction = new NotificationCompat.Action.Builder(R.mipmap.ic_launcher, "Stop",
                actionPendingIntent).build();

        // Build the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this.reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher).setContentTitle(title).setContentText(TICK)
                .setContentIntent(contentIntent).setPriority(NotificationCompat.PRIORITY_HIGH).setOnlyAlertOnce(true)
                .setOngoing(true).addAction(buttonAction);
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this.reactContext);

        // send notification
        // SERVICE_NOTIFICATION_ID is a unique int for each notification that you must
        // define
        notificationManager.notify(SERVICE_NOTIFICATION_ID, builder.build());

    }
}