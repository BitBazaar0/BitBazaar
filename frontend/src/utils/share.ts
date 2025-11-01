export const shareListing = async (title: string, url: string) => {
  const shareData = {
    title: title,
    text: `Check out this listing on BitBazaar: ${title}`,
    url: url,
  };

  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(url);
      return false; // Indicates we copied instead of shared
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      // User cancelled or error occurred
      try {
        await navigator.clipboard.writeText(url);
        return false;
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError);
        throw new Error('Failed to share or copy link');
      }
    }
    throw error;
  }
};

export const getShareUrl = (listingId: string) => {
  return `${window.location.origin}/listings/${listingId}`;
};

