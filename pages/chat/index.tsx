import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Chat.module.css";
import {
  ChangeEvent,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import SendIcon from "@/icons/send";
import ThemeWrapper from "dx-sdk/build/providers/Theme";
import { ModelCard } from "dx-sdk/build/components";
import useChatGPT from "@/hooks/useChatGPT";
import ExpandingTextArea from "@/components/expandingTextArea";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useModelsService } from "dx-sdk/build/services";
import toCurrency from "dx-sdk/build/utilities/toCurrency";
import { Heart, FilledHeart } from "dx-sdk/build/icons";

const inter = Inter({ subsets: ["latin"] });

const client = new ApolloClient({
  uri: "https://api-clayton-dx-orchestration.dev.cct-pubweb.com/graphql",
  cache: new InMemoryCache(),
});

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
  tokens: number;
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
  const chatAnchorRef = useRef<HTMLUListElement>(null);
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
  const [tokenCount, setTokenCount] = useState(0);
  const [models, setModels] = useState<any[]>([]);
  const modelsService = useModelsService({
    client,
    filters: {
      beds: userState.beds || 3,
      baths: userState.baths || 2,
      distance: userState.distance || 50,
      latitude: 36.0013,
      longitude: -83.9119,
      maxPrice: userState.maxPrice || 150000,
      minPrice: userState.minPrice || 0,
      maxSquareFeet: userState.maxSquareFeet || 3000,
      minSquareFeet: userState.minSquareFeet || 0,
    },
  });

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const handleInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const lastMessage = queue[queue.length - 1];

    setQueue([
      ...queue,
      {
        id: queue.length + 1,
        author: "user",
        content: prompt,
        tokens: 0,
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
          tokens: result.usage.total_tokens,
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
            tokens: result.usage.total_tokens,
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
          tokens: incomingMessage.tokens,
        },
      ]);
      setTokenCount(tokenCount + incomingMessage.tokens);
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

  useEffect(() => {
    chatAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [queue]);

  useEffect(() => {
    if (!modelsService.loading) {
      setModels(
        modelsService.data?.slice(0, 6).map((item) => ({
          key: item.modelNumber,
          images: item.thumbnailImages.slice(0, 5),
          heading: item.modelDescription,
          subheading: "Before Options",
          price: `${toCurrency(item.startingInThePrice || item.lowPrice, 0)}s`,
          info: [
            `${item.beds} beds`,
            `${item.baths} baths`,
            `${toCurrency(item.maxSquareFeet, 0, false)} sq. ft.`,
          ],
          componentsProps: {
            Action: {
              components: {
                Icon: Heart,
                CheckedIcon: FilledHeart,
              },
              id: item.modelNumber,
              // checked: userService.favorites?.includes(item.modelNumber),
              handlers: {
                // onChange: () =>
                // 	userService.actions?.toggleFavorite(item.modelNumber),
              },
            },
            Gallery: {
              carouselImageLink: true,
              carouselLinkProps: {
                href: `https://www.claytonhomes.com/homes/${item.modelNumber}/`,
                target: "_blank",
              },
            },
            Link: {
              href: `https://www.claytonhomes.com/homes/${item.modelNumber}`,
              target: "_blank",
            },
          },
        })) || []
      );
    }
  }, [modelsService.data, modelsService.loading]);

  return (
    <>
      <ThemeWrapper theme={{}}>
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
              ref={chatAnchorRef}
            >
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </section>
          <section
            className={`${styles.homes} ${
              activeTab === "homes" && styles.homesActive
            }`}
          >
            {!models.length && !modelsService.loading && (
              <>
                <h1 style={{ marginBottom: "10px" }}>No Homes found</h1>
                <p style={{ maxWidth: "400px" }}>
                  We don't currently have any homes that match your criteria,
                  try changing a few of your requirements.
                </p>
              </>
            )}
            {!!models.length && (
              <ul
                className={`${styles.homesList} ${
                  activeTab === "homes" && styles.homesActive
                }`}
              >
                {models?.map((model) => (
                  <li className={styles.home} key={model.key}>
                    <ModelCard {...model} />
                  </li>
                ))}
              </ul>
            )}
          </section>
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
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button type="submit" className={styles.send}>
                <SendIcon />
              </button>
            </form>
          </section>
        </main>
      </ThemeWrapper>
    </>
  );
}
