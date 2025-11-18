-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Division" (
    "division_id" SERIAL NOT NULL,
    "division_name" TEXT NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("division_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER,
    "division_id" INTEGER,
    "jabatan" TEXT,
    "toko" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticket_id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "submitted_by_user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Pending',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "kategori" TEXT NOT NULL,
    "sub_kategori" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "TicketDetail" (
    "ticket_id" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "attachments_json" JSONB,

    CONSTRAINT "TicketDetail_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "TicketLog" (
    "log_id" BIGSERIAL NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "actor_user_id" INTEGER NOT NULL,
    "action_type" TEXT NOT NULL,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "TicketAssignment" (
    "assignment_id" BIGSERIAL NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assignment_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAssignment_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "Division_division_name_key" ON "Division"("division_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_id_idx" ON "User"("role_id");

-- CreateIndex
CREATE INDEX "User_division_id_idx" ON "User"("division_id");

-- CreateIndex
CREATE INDEX "Ticket_submitted_by_user_id_idx" ON "Ticket"("submitted_by_user_id");

-- CreateIndex
CREATE INDEX "Ticket_type_idx" ON "Ticket"("type");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "TicketLog_ticket_id_idx" ON "TicketLog"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketLog_actor_user_id_idx" ON "TicketLog"("actor_user_id");

-- CreateIndex
CREATE INDEX "TicketAssignment_ticket_id_idx" ON "TicketAssignment"("ticket_id");

-- CreateIndex
CREATE INDEX "TicketAssignment_user_id_status_idx" ON "TicketAssignment"("user_id", "status");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "Division"("division_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketDetail" ADD CONSTRAINT "TicketDetail_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketLog" ADD CONSTRAINT "TicketLog_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketLog" ADD CONSTRAINT "TicketLog_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketAssignment" ADD CONSTRAINT "TicketAssignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
