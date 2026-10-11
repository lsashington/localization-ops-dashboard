export type ContentItem = {
 id: number;
 status: "Ordered" | "QA" | "In Translation" | "Delivered";
 title: string;
 vendor: string;
}

export type SortField = "title" | "status" | "vendor";