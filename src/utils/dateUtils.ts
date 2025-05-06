
export const formatDate = (date: string | Date) => {
  if (!date) return '';
  
  const dateObject = date instanceof Date ? date : new Date(date);
  
  return dateObject.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
