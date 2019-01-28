UPDATE users
set (username, email, user_image, about_text) = (${username},${email},${user_image},${about_text})
where id = ${id};
select id, username, email, about_text, is_active, user_image, verified, verification_code from users
WHERE id = ${id};