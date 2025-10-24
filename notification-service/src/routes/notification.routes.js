import express from "express"
import {
    createNotification,
    getNotificationsByUser,
    markNotificationAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnViewedCount,
} from "../controllers/notification.controllers.js"

const router = express.Router()

// Inject socket.io into controllers using middleware
export default (io) => {
    router.post("/", (req, res) => createNotification(req, res, io))
    router.get("/:userId", getNotificationsByUser)
    router.patch("/:id/read", markNotificationAsRead)
    router.patch("/mark-all/:userId", markAllAsRead)
    router.get("/unviewed/:userId", getUnViewedCount)
    router.get("/unread/:userId", getUnreadCount)

    return router
}
