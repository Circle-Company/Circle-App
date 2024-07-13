import notifee, { AndroidImportance } from "@notifee/react-native"

export async function onDisplayNotification() {
    // Request permissions (required for iOS)
    await notifee.requestPermission()

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
        id: "default",
        name: "Default Channel",
        badge: true, // disable in badges
    })

    // Display a notification
    await notifee.displayNotification({
        body: "@username liked your moment",
        android: {
            channelId,
            smallIcon: "ic_launcher",

            importance: AndroidImportance.DEFAULT,
        },
    })
}
