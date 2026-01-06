SET session_replication_role = replica;

DELETE FROM "TicketAssignment";
DELETE FROM "TicketLog";
DELETE FROM "TicketDetail";
DELETE FROM "Ticket";

DELETE FROM "User" WHERE user_id != 1;

SET session_replication_role = DEFAULT;
