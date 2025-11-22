// import { PrismaClient } from "@prisma/client"
// const prisma = new PrismaClient()

import { prisma } from "../lib/prisma.js"

// 🔹 Create a new notification
export const createNotification = async (req, res, io) => {
    try {
        const { userId, title, message, type, generatedById, generatedBy } = req.body

        const newNotification = await prisma.notification.create({
            data: { userId, title, message, type, generatedById, generatedBy },
        })

        // Emit to connected user's room
        io.to(`user:${userId}`).emit("notification", newNotification)

        res.status(201).json({ success: true, data: newNotification })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to create notification" })
    }
}

// 🔹 Get all notifications for a user
export const getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        })
        res.status(200).json({ success: true, data: notifications })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to fetch notifications" })
    }
}

// 🔹 Mark a single notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        })
        res.status(200).json({ success: true, data: notification })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to mark notification as read" })
    }
}

// 🔹 Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        })
        res.status(200).json({ success: true, count: result.count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to mark all as read" })
    }
}

// 🔹 Get unviewed count
export const getUnViewedCount = async (req, res) => {
    try {
        const { userId } = req.params
        const count = await prisma.notification.count({
            where: { userId, isViewed: false },
        })
        res.status(200).json({ success: true, count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to fetch unviewed count" })
    }
}

// 🔹 Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        })
        res.status(200).json({ success: true, count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, error: "Failed to fetch unread count" })
    }
}
