SELECT cm.content_image, cm.content_text, c.channel_name, cm.channel_id, cm.time_stamp
FROM channel_message cm
JOIN channel c ON c.id = cm.channel_id
WHERE cm.user_id = $1
ORDER BY cm.time_stamp ASC
LIMIT 10

-- May need to change asc to desc.  Not 100% that this is most recent