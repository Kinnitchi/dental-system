import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
});

export const userRelationsTable = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const usersToClinicsRelationsTable = relations(usersToClinicsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [usersToClinicsTable.userId],
    references: [usersTable.id],
  }),
  clinic: one(clinicsTable, {
    fields: [usersToClinicsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));

export const clinicRelationsTable = relations(clinicsTable, ({ many }) => ({
  dentists: many(dentistsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const dentistsTable = pgTable("dentists", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avartarImageUrl: text("avartar_image_url").notNull(),
  specialty: text("specialty").notNull(),
  appointmentsPriceInCents: integer("appointments_price_in_cents").notNull(),
  // 1 Monday, 2 Tuesday, 3 Wednesday, 4 Thursday, 5 Friday, 6 Saturday, 0 Sunday
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(), // 5 (Friday) to 6 (Saturday)
  availableFromTime: time("available_from_time").notNull(), // 540 (9:00 AM)
  availableToTime: time("available_to_time").notNull(), // 1020 (5:00 PM)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const dentistRelationsTable = relations(dentistsTable, ({ one, many }) => ({
  clinic: one(clinicsTable, {
    fields: [dentistsTable.clinicId],
    references: [clinicsTable.id],
  }),
  appoiments: many(appointmentsTable),
}));

// enum for appointment status

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);
export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avartarImageUrl: text("avartar_image_url").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  sex: patientSexEnum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const patientRelationsTable = relations(patientsTable, ({ one, many }) => ({
  clinic: one(clinicsTable, {
    fields: [patientsTable.clinicId],
    references: [clinicsTable.id],
  }),
  appoiments: many(appointmentsTable),
}));

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  dentistId: uuid("dentist_id")
    .notNull()
    .references(() => dentistsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  appointmentDateTime: timestamp("appointment_date_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const appointmentRelationsTable = relations(appointmentsTable, ({ one }) => ({
  dentist: one(dentistsTable, {
    fields: [appointmentsTable.dentistId],
    references: [dentistsTable.id],
  }),
  patient: one(patientsTable, {
    fields: [appointmentsTable.patientId],
    references: [patientsTable.id],
  }),
  clinic: one(clinicsTable, {
    fields: [appointmentsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));
