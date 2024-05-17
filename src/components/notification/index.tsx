import container_center from "./components/containers/container-center";
import container_left from "./components/containers/container-left";
import container_main from "./components/containers/container-main";
import container_right from "./components/containers/container-right";
import notification_seal from "./components/notification-seal";
import notification_text from "./components/notification-text";
import notification_viewed from "./components/notification-viewed";

export const Notification = {
    Seal: notification_seal,
    Viewed: notification_viewed,
    Text: notification_text,
    Container: {
        Main: container_main,
        Center: container_center,
        Left: container_left,
        Right: container_right
    }

}