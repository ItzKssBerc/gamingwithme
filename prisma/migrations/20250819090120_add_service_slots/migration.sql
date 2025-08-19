-- CreateTable
CREATE TABLE "public"."service_slots" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."service_slots" ADD CONSTRAINT "service_slots_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."fixed_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
