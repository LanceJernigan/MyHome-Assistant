import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Chat.module.css";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import SendIcon from "@/icons/send";
import useChatGPT from "@/hooks/useChatGPT";
import ExpandingTextArea from "@/components/expandingTextArea";

const inter = Inter({ subsets: ["latin"] });

const salesRepMessages = [
  {
    role: "system",
    content: `You are an ai assistant that helps customers find their dream home to purchase.  Your name is MyHome Assistant.  When responding you should be witty, relaxed, and relatable but still professional.  New input should trump known information.  You need to ask the customer one question at a time to find the following answers: minimum beds (beds), minimum baths (baths), zipcode for search (zipcode), distance from zipcode (distance), maximum price of home (maxPrice), minimum price of home (minPrice), max square feet of home (maxSquareFeet).  If there is known information assume we've already started a conversation.  Use known information for context.  If you know the answer to a question skip it.`,
  },
];

const jsonParserMessages = [
  {
    role: "system",
    content: `You're an ai that takes natural language and parses it into json format.  You should never return anything but valid JSON.  If a value is unknown return null.  New information should always trump known information.  The format should be as follows: { beds: number, baths: number, zipcode: string, distance: number, maxPrice: number, minPrice: number, maxSquareFeet: number, minSquareFeet: number }.`,
  },
];

interface Message {
  id: number;
  author: "system" | "user";
  content: string;
}

interface UserState {
  beds: null | number;
  baths: null | number;
  zipcode: null | number;
  distance: null | number;
  maxPrice: null | number;
  minPrice: null | number;
  maxSquareFeet: null | number;
  minSquareFeet: null | number;
}
export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("queue");
  const [loading, setLoading] = useState(false);
  const [incomingMessage, setIncomingMessage] = useState<Message | null>(null);
  const [queue, setQueue] = useState<Message[]>([]);
  const [userState, setUserState] = useState<UserState>({
    beds: null,
    baths: null,
    zipcode: null,
    distance: null,
    maxPrice: null,
    minPrice: null,
    maxSquareFeet: null,
    minSquareFeet: null,
  });

  const handleInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const lastMessage = queue[queue.length - 1];

    setQueue([
      ...queue,
      {
        id: queue.length + 1,
        author: "user",
        content: prompt,
      },
    ]);
    setPrompt("");
    setLoading(true);
    useChatGPT([
      ...salesRepMessages,
      {
        role: "system",
        content: `known information: ${JSON.stringify(userState)}`,
      },
      {
        role: "system",
        content: `last question: ${lastMessage.content}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ]).then((result) => {
      const choice = result.choices[0];

      if (choice) {
        setIncomingMessage({
          id: queue.length + 1,
          author: "system",
          content: choice.message.content,
        });
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    if (!loading && !queue.length) {
      setLoading(true);
      useChatGPT(salesRepMessages).then((result) => {
        const choice = result.choices[0];

        if (choice) {
          setIncomingMessage({
            id: 0,
            author: "system",
            content: choice.message.content,
          });
        }

        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (incomingMessage) {
      setQueue([
        ...queue,
        {
          id: incomingMessage.id || queue.length + 1,
          author: incomingMessage.author,
          content: incomingMessage.content,
        },
      ]);
    }
  }, [incomingMessage]);

  useEffect(() => {
    const lastMessage = queue[queue.length - 1];

    if (lastMessage?.author === "user") {
      useChatGPT([
        ...jsonParserMessages,
        {
          role: "system",
          content: `last question: ${queue[queue.length - 2].content}`,
        },
        {
          role: "system",
          content: `known information: ${JSON.stringify(userState)}`,
        },
        {
          role: "user",
          content: `last answer: ${lastMessage.content}`,
        },
      ]).then((response) => {
        const jsonMatches =
          response.choices[0].message.content.match(/({.*})/gs);
        const newState =
          jsonMatches?.[0] && jsonMatches?.[0][0] === "{"
            ? JSON.parse(jsonMatches[0]) || null
            : null;

        if (newState) {
          setUserState(newState);
        }
      });
    }
  }, [queue]);

  console.log(userState);

  return (
    <>
      <Head>
        <title>MyHome Assistant</title>
        <meta
          name="description"
          content="Chat assistant to help you find your dream home."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <header className={styles.header}>
          <p>MyHome Assistant</p>
        </header>
        <section
          className={`${styles.queue} ${
            activeTab === "queue" && styles.queueActive
          }`}
        >
          {queue.map((message) => (
            <section
              className={`${styles.message} ${
                styles[`message-${message.author}`]
              }`}
              key={message.id}
            >
              <p>{message.content}</p>
            </section>
          ))}
          <ul
            className={`${styles.loading} ${
              styles[loading ? "loadingActive" : "loadingInactive"]
            }`}
          >
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </section>
        <ul
          className={`${styles.homes} ${
            activeTab === "homes" && styles.homesActive
          }`}
        >
          <li className={styles.home}></li>
          <li className={styles.home}></li>
          <li className={styles.home}></li>
          <li className={styles.home}></li>
        </ul>
        <section className={styles.chat}>
          <ul className={styles.navigation}>
            <li>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "queue" && styles.tabButtonActive
                }`}
                onClick={() => setActiveTab("queue")}
              >
                Chat
              </button>
            </li>
            <li>
              <button
                className={`${styles.tabButton} ${
                  activeTab === "homes" && styles.tabButtonActive
                }`}
                onClick={() => setActiveTab("homes")}
              >
                Homes
              </button>
            </li>
          </ul>
          <form className={styles.form} onSubmit={handleSubmit}>
            <ExpandingTextArea
              className={`${styles.textarea} ${inter.className}`}
              value={prompt}
              onInput={handleInput}
              rows={1}
            />
            <button type="submit" className={styles.send}>
              <SendIcon />
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
