export const calculateEngagementRate = (
  views,
  likes,
  comments
) => {
  if (!views || views === 0) return 0;

  return Number(
    (((likes + comments) / views) * 100).toFixed(2)
  );
};