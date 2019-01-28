INSERT INTO channel (channel_name, creator_id, channel_description, channel_url)
VALUES (${channel_name}, ${creator_id}, ${channel_description}, ${channel_url})
RETURNING *;