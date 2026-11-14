export type ContentItem = {
 id: number;
 status: "Ordered" | "QA" | "In Translation" | "Delivered";
 title: string;
 vendor: string;
 dueDate: string | null;
}

export type SortField = "title" | "status" | "vendor" | "dueDate" | "risk";