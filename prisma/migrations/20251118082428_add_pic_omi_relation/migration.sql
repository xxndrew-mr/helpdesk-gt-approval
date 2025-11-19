-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pic_omi_id" INTEGER;

-- CreateIndex
CREATE INDEX "User_pic_omi_id_idx" ON "User"("pic_omi_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pic_omi_id_fkey" FOREIGN KEY ("pic_omi_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
