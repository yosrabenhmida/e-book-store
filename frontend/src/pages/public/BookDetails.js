import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState({});

  useEffect(() => {
    // Appel direct au backend
    axios
      .get(`http://localhost:3001/books/${id}`) // backend sur le port 3001
      .then((res) => setBook(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div>
      {book.title ? (
        <>
          <h2>{book.title}</h2>
          <p>Prix: {book.price} TND</p>
          <p>Auteur: {book.author}</p>
        </>
      ) : (
        <p>Chargement du livre...</p>
      )}
    </div>
  );
}

export default BookDetails;
