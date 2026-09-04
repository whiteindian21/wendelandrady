import { z } from "zod";

export const orgNameSchema = z
  .string()
  .trim()
  .min(2, "Organization name must be at least 2 characters.")
  .max(100, "Organization name must be at most 100 characters.");

export const orgSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(63, "Slug must be at most 63 characters.")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug may only contain lowercase letters, numbers and hyphens."
  );

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "URL is too long.")
  .refine(
    (value) => value === "" || /^https?:\/\/.+/.test(value),
    "Logo URL must start with http:// or https://."
  )
  .transform((value) => (value === "" ? null : value));

export const optionalTimezoneSchema = z
  .string()
  .trim()
  .max(64, "Timezone is too long.")
  .transform((value) => (value === "" ? null : value));

export const createOrganizationSchema = z.object({
  name: orgNameSchema,
  slug: orgSlugSchema,
});

export const updateOrganizationSchema = z.object({
  name: orgNameSchema,
  slug: orgSlugSchema,
  logoUrl: optionalUrlSchema,
  timezone: optionalTimezoneSchema,
});

export const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  // 'owner' is not representable here — enforced by the DB enum as well.
  role: z.enum(["admin", "member"], {
    message: "Role must be Admin or Member.",
  }),
});

export const roleChangeSchema = z.object({
  memberId: z.string().uuid("Invalid member."),
  role: z.enum(["admin", "member"], {
    message: "Role must be Admin or Member.",
  }),
});

export const memberMutationSchema = z.object({
  memberId: z.string().uuid("Invalid member."),
});

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid("Invalid organization."),
});

export const deleteOrganizationSchema = z.object({
  confirmName: z.string().trim().min(1, "Type the organization name to confirm."),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationValues = z.infer<typeof updateOrganizationSchema>;
export type InviteValues = z.infer<typeof inviteSchema>;