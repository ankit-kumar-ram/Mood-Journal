import { useState, useEffect } from "react";

const Quotes = () => {
  const [quote, setQuote] = useState("Hello");
  const [author, setAuthor] = useState("-Author");

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/quote");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        console.log("Quote API response:", data);

        // Assuming it's always an array with one object
        const quoteObj = data[0];
        setQuote(quoteObj.q || "Stay positive, work hard, make it happen.");
        setAuthor(quoteObj.a || "Author");
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        setQuote("The best way out is always through.");
        setAuthor("Robert Frost");
      }
    };

    fetchQuote();
  }, []);

  return (
    <>
      <h1 className="text-center quote-content">{`"${quote}"`}</h1>
      <h2 className="text-end quote-author">{`- ${author}`}</h2>
    </>
  );
};

export default Quotes;
