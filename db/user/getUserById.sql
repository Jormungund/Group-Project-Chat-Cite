SELECT users.id, users.username, users.about_text, users.user_image, users.verified FROM users
WHERE id = $1;

