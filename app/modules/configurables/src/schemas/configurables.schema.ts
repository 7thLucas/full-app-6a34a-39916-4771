/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 120,
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "colors",
      type: "object",
      required: false,
      label: "Extended Colors",
      fields: [
        {
          fieldName: "background",
          type: "color",
          required: false,
          label: "Background",
        },
        {
          fieldName: "surface",
          type: "color",
          required: false,
          label: "Surface",
        },
        {
          fieldName: "border",
          type: "color",
          required: false,
          label: "Border",
        },
        {
          fieldName: "bestPriceGreen",
          type: "color",
          required: false,
          label: "Best Price Green",
        },
        {
          fieldName: "dropRed",
          type: "color",
          required: false,
          label: "Drop / Exclusive Red",
        },
        {
          fieldName: "textPrimary",
          type: "color",
          required: false,
          label: "Text Primary",
        },
        {
          fieldName: "textSecondary",
          type: "color",
          required: false,
          label: "Text Secondary",
        },
      ],
    },
    {
      fieldName: "searchPlaceholder",
      type: "string",
      required: false,
      label: "Search Placeholder Text",
      maxLength: 80,
    },
    {
      fieldName: "heroHeadline",
      type: "string",
      required: false,
      label: "Hero Headline",
      maxLength: 100,
    },
    {
      fieldName: "heroSubline",
      type: "string",
      required: false,
      label: "Hero Subline",
      maxLength: 200,
    },
    {
      fieldName: "ctaLabel",
      type: "string",
      required: false,
      label: "CTA Button Label",
      maxLength: 40,
    },
    {
      fieldName: "platforms",
      type: "array",
      required: false,
      label: "Platforms",
      item: {
        type: "string",
        required: true,
      },
    },
    {
      fieldName: "footerText",
      type: "string",
      required: false,
      label: "Footer Text",
      maxLength: 200,
    },
    {
      fieldName: "showDropBanner",
      type: "boolean",
      required: false,
      label: "Show Exclusive Drop Banner",
    },
    {
      fieldName: "maxResultsPerSearch",
      type: "number",
      required: false,
      label: "Max Results Per Search",
      min: 5,
      max: 50,
    },
  ],
};
