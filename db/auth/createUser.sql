INSERT INTO users (username, email, pw, user_image, about_text,is_active,verified)
VALUES (${username}, ${email}, ${hash}, ${user_image}, ${about_text}, true, false)
RETURNING *;