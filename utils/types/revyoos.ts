export type revyoos_review_object_type = {
  _id: string;
  text: string | null;
  title: string | null;
  rating: number;
  originalRating: number | null;
  originalMaxRating: number | null;
  date: string;
  createdAt: string | null;
  updatedAt: string | null;
  reviewer: string | null;
  reviewerAvatar: string | null;
  channel:
    | "airbnb"
    | "booking"
    | "google"
    | "tripadvisor"
    | "vrbo"
    | "expedia"
    | "trustpilot"
    | "revyoos"
    | null;
  url: string | null;
  holding: {
    _id: string;
    name: string;
  } | null;
  reply: string | null;
  sentiment: "Positive" | "Neutral" | "Negative" | null;
  topics: Array<{
    topic: string;
    tag: string;
    sentiment: "Positive" | "Neutral" | "Negative";
  }>;
};

export type revyoos_pagination_type = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type revyoosReviewsReturnType = {
  success: true;
  data: {
    reviews: revyoos_review_object_type[];
    pagination: revyoos_pagination_type;
  };
};
