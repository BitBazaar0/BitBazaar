import { Box, Typography, Paper, Stack, Rating } from '@mui/material';
import { useState, useRef } from 'react';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

interface Testimonial {
  id: string;
  text: string;
  author: string;
  rating: number;
  source: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    text: 'My experience with BitBazaar has been great! I\'ve been able to start selling PC parts and am making great money. The platform is easy to use and the community is supportive.',
    author: 'Cooper B.',
    rating: 5,
    source: 'TrustPilot',
  },
  {
    id: '2',
    text: 'Super easy to start up and run. The customer service was very helpful and patient. 10/10 will recommend to anyone in the market for PC parts!',
    author: 'Javier G.',
    rating: 5,
    source: 'BitBazaar',
  },
  {
    id: '3',
    text: 'I\'ve been buying & selling on BitBazaar for a while now. The community is full of incredible people and staff is always willing to help. I always list my things on BitBazaar FIRST!',
    author: 'George M.',
    rating: 5,
    source: 'TrustPilot',
  },
  {
    id: '4',
    text: 'Consistency of great service and great experiences! The marketplace makes it so easy to find quality PC components.',
    author: 'Jonathan W.',
    rating: 5,
    source: 'TrustPilot',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = 400; // Approximate width
    const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;
    
    container.scrollTo({
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth',
    });

    setCurrentIndex((prev) => {
      if (direction === 'right') {
        return Math.min(prev + 1, testimonials.length - 1);
      } else {
        return Math.max(prev - 1, 0);
      }
    });
  };

  return (
    <Box sx={{ mb: 8 }}>
      <Typography variant="h3" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
        What Our Users Say
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            pb: 2,
            mx: -2,
            px: 2,
          }}
        >
          {testimonials.map((testimonial) => (
            <Paper
              key={testimonial.id}
              sx={{
                minWidth: { xs: '85%', sm: 350, md: 400 },
                maxWidth: { xs: '85%', sm: 350, md: 400 },
                p: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack spacing={2}>
                <Rating value={testimonial.rating} readOnly size="small" />
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  "{testimonial.text}"
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    - {testimonial.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {testimonial.source}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Box>

        {testimonials.length > 1 && (
          <>
            <IconButton
              onClick={() => handleScroll('left')}
              disabled={currentIndex === 0}
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.default',
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => handleScroll('right')}
              disabled={currentIndex >= testimonials.length - 1}
              sx={{
                position: 'absolute',
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.default',
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
                display: { xs: 'none', md: 'flex' },
              }}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

