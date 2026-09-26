package com.ltuga.zeitkonto;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

/** No credentials, network polling or personal information in the launcher. */
public final class ZeitkontoWidget extends AppWidgetProvider {
    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.zeitkonto_widget);
            bind(context, views, id, R.id.widget_title, "today");
            bind(context, views, id, R.id.widget_record, "today");
            bind(context, views, id, R.id.widget_calendar, "calendar");
            bind(context, views, id, R.id.widget_balance, "balances");
            manager.updateAppWidget(id, views);
        }
    }
    private static void bind(Context context, RemoteViews views, int widgetId, int viewId, String target) {
        Intent intent = new Intent(context, MainActivity.class)
            .setAction(WidgetDestination.ACTION)
            .setData(Uri.parse("zeitkonto-widget://open/" + widgetId + "/" + target))
            .putExtra(WidgetDestination.EXTRA, target)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        views.setOnClickPendingIntent(viewId, PendingIntent.getActivity(context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
    }
}
