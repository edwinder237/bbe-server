////REVYOOS///




///REVYOOS API REQUESTS

//REVIEWS

export type revyoos_navigate_to_user_profile_object_type = {
  url: string;
  user_id: string;
};

export type revyoos_image_object_type = {
  id: string;
  base_url: string;
  on_press_action: {
    navigate_to_user_profile: revyoos_navigate_to_user_profile_object_type;
  };
};

export type revyoos_user_object_type = {
  deleted: boolean;
  first_name: string;
  host_name: string;
  id: number;
  picture_url: string;
  profile_path: string;
  is_superhost: boolean;
  badges: unknown[];
  user_profile_picture: {
    image: revyoos_image_object_type;
  };
};

export type revyoos_extra_data_object_type = {
  id: number;
  language: string;
  localized_date: string;
  reviewer: revyoos_user_object_type;
  reviewee: revyoos_user_object_type;
};

export type revyoos_lang_object_type = {
  lang: string;
  prob: number;
};

export type revyoos_generated_answer_object_type = {
  answer: string;
  translate: string;
  userLanguage: string;
  reviewLanguage: string;
  tone: string;
  reviewRating: number;
  isUsingGuestName: boolean;
  isUsingPropertyName: boolean;
  signature: string;
  isUsingSignature: boolean;
  isGeneratedNew: boolean;
  isNeedToTranslate: boolean;
  nuance: string;
  created: string;
};

export type revyoos_generating_settings_object_type = {
  tone: string;
  isUsingRating: boolean;
  isUsingGuestName: boolean;
  isUsingPropertyName: boolean;
  signature: string;
  isUsingSignature: boolean;
};

export type revyoos_copied_answer_object_type = {
  translate: string;
  answer: string;
};

export type revyoos_review_object_type = {
  _id: string;
  fk_id_file_reviews: string | null;
  status_reviews: number;
  o_extra_data: revyoos_extra_data_object_type;
  hide: boolean;
  generatedAnswers: revyoos_generated_answer_object_type[];
  reviewTranslation: unknown[];
  titleTranslation: unknown[];
  fk_id_user_reviews: string;
  fk_id_holding_reviews: string;
  fk_id_source_reviews: string;
  type_source_reviews: string;
  url_reviews: string;
  score_reviews: number;
  original_score_reviews: number;
  max_score_reviews: number;
  title_reviews: string;
  content_reviews: string;
  date: string;
  name_user_reviews: string;
  img_user_reviews: string;
  owner_response_reviews: string;
  checksum_reviews: string;
  update: string;
  db_date: string;
  db_update: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  lang: revyoos_lang_object_type | revyoos_lang_object_type[];
  icon: string;
  sourceTypeTitle: string;
  sourceUrl: string;
  generatingSettings?: revyoos_generating_settings_object_type;
  copiedAnswer?: revyoos_copied_answer_object_type;
};

export type revyoosReviewsReturnType = {
  b_valid: boolean;
  a_reviews: revyoos_review_object_type[];
};
