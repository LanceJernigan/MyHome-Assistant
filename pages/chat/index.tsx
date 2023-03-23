import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Chat.module.css";
import { useEffect, useState } from "react";
import SendIcon from "@/icons/send";
import useChatGPT from "@/hooks/useChatGPT";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [activeTab, setActiveTab] = useState("queue");
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<
    { id: number; author: "system" | "user"; content: string }[]
  >([]);

  useEffect(() => {
    setLoading(true);
    useChatGPT([
      {
        role: "system",
        content: `You are a sales representative named 'MyHome Assistant' who helps customers find the best model for them.  You should speak in a witty, relaxed, and relatable tone.  You need to as the customer one question at a time to find the following answers: minimum beds (beds), minimum baths (baths), zipcode for search (zipcode), distance from zipcode (distance), max price of home (maxPrice), min price of home (minPrice), max square feet of home (maxSquareFeet), min square feet of home (minSquareFeet).  If you know the answer to a question feel free to skip it.`,
      },
    ]).then((result) => {
      const choice = result.choices[0];

      if (choice) {
        setQueue([
          ...queue,
          {
            id: queue.length + 1,
            author: "system",
            content: choice.message.content,
          },
        ]);
      }

      setLoading(false);
    });
  }, []);

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
          <form className={styles.form}>
            <textarea className={styles.textarea} />
            <button type="submit" className={styles.send}>
              <SendIcon />
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
