'use client'
import { Box, Button, Stack, TextField, IconButton, CircularProgress, useMediaQuery } from '@mui/material';
import { useState, useEffect } from 'react';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi I am the Ummati support agent, How can I assist you today?',
    }
  ]);
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // State to control the loading spinner
  const [darkMode, setDarkMode] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1db954',
      },
      secondary: {
        main: '#0d7377',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  const sendMessage = async () => {
    if (!message.trim()) return;

    setMessage('');
    setLoading(true); // Show the spinner
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    reader.read().then(function processText({ done, value }) {
      if (done) {
        setLoading(false); // Hide the spinner
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: result,
            },
          ];
        });
        return;
      }

      const text = decoder.decode(value, { stream: true });
      result += text;

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });

      reader.read().then(processText);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const lastMessage = document.querySelector('#messages-container > :last-child');
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.background.default}
        p={2}
      >
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          sx={{ alignSelf: 'flex-end', mb: 2 }}
          aria-label="toggle theme"
        >
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <Stack
          direction="column"
          width={isMobile ? "100%" : "600px"}
          height="70vh"
          border={`2px solid ${theme.palette.primary.main}`}
          borderRadius={8}
          p={3}
          spacing={3}
          bgcolor={theme.palette.background.paper}
          boxShadow={`0px 0px 20px ${theme.palette.primary.main}`}
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            id="messages-container"
            sx={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: theme.palette.primary.main,
                borderRadius: '10px',
              },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
                sx={{
                  animation: 'fadeIn 0.5s ease-in-out',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                  },
                }}
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? theme.palette.primary.main
                      : theme.palette.secondary.main
                  }
                  color="white"
                  borderRadius={16}
                  p={2}
                  maxWidth="80%"
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Type your message..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              InputLabelProps={{
                style: { color: theme.palette.primary.main },
              }}
              InputProps={{
                style: { color: theme.palette.text.primary },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.secondary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Box sx={{ position: 'relative', width: '100px' }}>
              <Button
                variant="contained"
                onClick={sendMessage}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.background.default,
                  width: '100%',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.main,
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.primary.light,
                  },
                }}
                disabled={loading} // Disable the button while loading
              >
                Send
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: theme.palette.secondary.main,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}

