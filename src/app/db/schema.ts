import { boolean, decimal, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const mySchema = pgSchema("vento");

export const users = mySchema.table("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    name: text("name"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const businesses = mySchema.table("businesses", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    logoUrl: text("logo_url"),
    isPro: boolean("is_pro").default(false),
    plan: text("plan").default("free"),
    ownerId: uuid("owner_id").references(() => users.id),
})

export const branches = mySchema.table("branches", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    addressCoordinates: jsonb("address_coordinates"),
    phoneNumbers: jsonb("phone_numbers"),
    businessId: uuid("business_id").references(() => businesses.id),
})

export const branchesConfig = mySchema.table("branches_config", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id),
    hasKitchen: boolean("has_kitchen").default(false),
    hasDelivery: boolean("has_delivery").default(false),
    hasBackOffice: boolean("has_back_office").default(false),
    hasMobileApp: boolean("has_mobile_app").default(false),
    hasPos: boolean("has_pos").default(false),
    hasCustomers: boolean("has_customers").default(false),
    ticketGroupingMode: text("ticket_grouping_mode").default("sum"),
})

//plans tables

export const plans_info = mySchema.table("plans_info", {
    id: uuid("id").defaultRandom().primaryKey(),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    recurring: boolean("recurring").default(false),
    businessId: uuid("business_id").references(() => businesses.id),
})

export const plans_payments = mySchema.table("plans_payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    amount: integer("amount").notNull(),
    currency: text("currency").default("USD"),
    paymentMethod: text("payment_method").notNull(),
    paymentDate: timestamp("payment_date").defaultNow(),
    businessId: uuid("business_id").references(() => businesses.id),
})


//shifts tables

export const shifts = mySchema.table("shifts", {
    id: uuid("id").defaultRandom().primaryKey(),
    status: text("status").notNull(),
    branchId: uuid("branch_id").references(() => branches.id),
    openedBy: uuid("opened_by").references(() => users.id),
    closedBy: uuid("closed_by").references(() => users.id),
    initialCash: decimal("initial_cash", { precision: 10, scale: 2 }).default("0"),
    finalCash: decimal("final_cash", { precision: 10, scale: 2 }).default("0"),
    expectedCash: decimal("expected_cash", { precision: 10, scale: 2 }).default("0"),
    totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
    ticketCounter: integer("ticket_counter").default(0),
    openedAt: timestamp("opened_at").defaultNow(),
    closedAt: timestamp("closed_at"),
})

//employees tables

export const employees = mySchema.table("employees", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id,{
        onDelete: "cascade"
    }),
    userId: uuid("user_id").references(() => users.id,{
        onDelete: "cascade"
    }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    isOwner: boolean("is_owner").default(false),
    isManager: boolean("is_manager").default(false),
    isCashier: boolean("is_cashier").default(false),
    isKitchen: boolean("is_kitchen").default(false),
    isDelivery: boolean("is_delivery").default(false),
    isWaiter: boolean("is_waiter").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

//customers tables

export const customers = mySchema.table("customers", {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id").references(() => businesses.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

//inventory tables

export const items = mySchema.table("items", {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id").references(() => businesses.id), // <-- El dueño lo crea una vez
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Precio sugerido base
    categoryId: uuid("category_id").references(() => categories.id),
    image: text("image"),
    sku: text("sku"),
    isActive: boolean("is_active").default(true),
})

// 2. Disponibilidad y Stock por Sucursal (La tabla "Puente")
export const branch_items = mySchema.table("branch_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id),
    itemId: uuid("item_id").references(() => items.id),
    
    // Aquí resuelves tu duda:
    isActiveInBranch: boolean("is_active_in_branch").default(true), // ¿Se vende en esta sucursal?
    customPrice: decimal("custom_price", { precision: 10, scale: 2 }), // Por si en la playa es más caro
    isAvailable: boolean("is_available").default(true),
    trackInventory: boolean("track_inventory").default(true),
    stock: decimal("stock", { precision: 10, scale: 2 }).default("0"),
    minStock: decimal("min_stock", { precision: 10, scale: 2 }).default("0"),
    isCustom: boolean("is_custom").default(false),
    customKinds: jsonb("custom_kinds"),

})

export const inventory_logs = mySchema.table("inventory_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    itemId: uuid("item_id").references(() => items.id),
    branchId: uuid("branch_id").references(() => branches.id),
    userId: uuid("user_id").references(() => users.id),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason").notNull(), // "sale", "restock", "damage", "return"
    createdAt: timestamp("created_at").defaultNow(),
})


export const categories = mySchema.table("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    businessId: uuid("business_id").references(() => businesses.id),
})


//kitchen tables

export const kitchen = mySchema.table("kitchen", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    businessId: uuid("business_id").references(() => businesses.id),
    branchId: uuid("branch_id").references(() => branches.id),
})

export const kitchenProducts = mySchema.table("kitchen_products", {
    id: uuid("id").defaultRandom().primaryKey(),
    kitchenId: uuid("kitchen_id").references(() => kitchen.id),
    ticketId: uuid("ticket_id").references(() => tickets.id),
    itemId: uuid("item_id").references(() => items.id),
    selectedCustomKind: text("selected_custom_kind"),
    groupId: text("group_id"),
    quantity: integer("quantity").default(1),
    status: text("status").default("pending"),
    priority: integer("priority").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
})

//tickets tables

export const tickets = mySchema.table("tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id),
    shiftId: uuid("shift_id").references(() => shifts.id),
    customerId: uuid("customer_id").references(() => customers.id),
    ticketNumber: text("ticket_number").notNull(),
    ticketType: text("ticket_type").default("dine_in"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
    status: text("status").default("pending"),
    paymentMethod: text("payment_method").default("cash"),
    paymentStatus: text("payment_status").default("pending"),
    inSubTickets: boolean("in_sub_tickets").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    closedAt: timestamp("closed_at"),
})


export const ticketItems = mySchema.table("ticket_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "cascade" }),
    itemId: uuid("item_id").references(() => items.id),
    quantity: integer("quantity").default(1),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    groupId: text("group_id"),
    status: text("status").default("pending"),
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
    taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
    selectedCustomKind:text("selected_custom_kind"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})

//discounts and offers tables

export const discounts = mySchema.table("discounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    discountType: text("discount_type").default("percentage"),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    isAlwaysActive: boolean("is_always_active").default(false),
    daysOfWeek: text("days_of_week"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    businessId: uuid("business_id").references(() => businesses.id),
    branchId: uuid("branch_id").references(() => branches.id),
})

export const offers = mySchema.table("offers", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    offerType: text("offer_type").default("percentage"),
    offerValue: decimal("offer_value", { precision: 10, scale: 2 }).notNull(),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    isAlwaysActive: boolean("is_always_active").default(false),
    daysOfWeek: text("days_of_week"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    isPackage: boolean("is_package").default(false),
    items: jsonb("items").default([]),
    businessId: uuid("business_id").references(() => businesses.id),
    branchId: uuid("branch_id").references(() => branches.id),
})

//stats tables 

export const branch_stats_daily = mySchema.table("branch_stats_daily", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id),
    date: timestamp("date").notNull(), // Solo la fecha (sin hora)
    totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
    totalOrders: integer("total_orders").default(0),
    averageTicket: decimal("average_ticket", { precision: 10, scale: 2 }).default("0"),
})


export const product_stats_daily = mySchema.table("product_stats_daily", {
    id: uuid("id").defaultRandom().primaryKey(),
    branchId: uuid("branch_id").references(() => branches.id),
    itemId: uuid("item_id").references(() => items.id),
    date: timestamp("date").notNull(),
    quantitySold: decimal("quantity_sold", { precision: 10, scale: 2 }).default("0"),
    totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
})

//taxes
export const taxes = mySchema.table("taxes", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(), // Ej: "IVA", "ISR"
    percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // Ej: 16.00
    businessId: uuid("business_id").references(() => businesses.id),
    isDefault: boolean("is_default").default(false),
})

// Relations
export const itemsRelations = relations(items, ({ one }) => ({
    category: one(categories, {
        fields: [items.categoryId],
        references: [categories.id],
    }),
    business: one(businesses, {
        fields: [items.businessId],
        references: [businesses.id],
    }),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
    business: one(businesses, {
        fields: [categories.businessId],
        references: [businesses.id],
    }),
}));

export const branchItemsRelations = relations(branch_items, ({ one }) => ({
    item: one(items, {
        fields: [branch_items.itemId],
        references: [items.id],
    }),
    branch: one(branches, {
        fields: [branch_items.branchId],
        references: [branches.id],
    }),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
    branch: one(branches, {
        fields: [employees.branchId],
        references: [branches.id],
    }),
    user: one(users, {
        fields: [employees.userId],
        references: [users.id],
    }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
    branch: one(branches, {
        fields: [tickets.branchId],
        references: [branches.id],
    }),
    customer: one(customers, {
        fields: [tickets.customerId],
        references: [customers.id],
    }),
    ticketItems: many(ticketItems),
}));

export const ticketItemsRelations = relations(ticketItems, ({ one }) => ({
    ticket: one(tickets, {
        fields: [ticketItems.ticketId],
        references: [tickets.id],
    }),
    item: one(items, {
        fields: [ticketItems.itemId],
        references: [items.id],
    }),
}));