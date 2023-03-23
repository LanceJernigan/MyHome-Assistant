import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Chat.module.css";
import { useState } from "react";
import SendIcon from "@/icons/send";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [activeTab, setActiveTab] = useState("queue");

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
          <section className={`${styles.message} ${styles["message-system"]}`}>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil
              delectus distinctio labore animi aspernatur, facilis dignissimos
              vero, inventore, quod repellendus sunt eveniet sapiente.
              Temporibus nobis distinctio commodi voluptates quod suscipit?
            </p>
          </section>
          <section className={`${styles.message} ${styles["message-user"]}`}>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil
              delectus distinctio labore animi aspernatur, facilis dignissimos
              vero, inventore, quod repellendus sunt eveniet sapiente.
              Temporibus nobis distinctio commodi voluptates quod suscipit?
            </p>
          </section>
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
