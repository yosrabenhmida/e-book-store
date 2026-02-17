import { useEffect, useState } from "react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Utilisation directe d'axios
    axios
      .get("http://localhost:3001/orders/my") // backend sur port 3001
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Mes Commandes</h2>

      {orders.length === 0 ? (
        <p>Aucune commande trouvée</p>
      ) : (
        orders.map((order) => (
          <div key={order._id}>
            {order.totalPrice} TND - {order.status}
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;
