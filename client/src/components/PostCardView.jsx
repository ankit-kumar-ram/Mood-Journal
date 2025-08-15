import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import formatDate from "../utils/formatDate";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const PostCardView = ({ post, isPrivate, deletePostFromArray }) => {
  const { _id, title, content, date, moodColor, moodEmoji } = post;
  const navigate = useNavigate();

  const openPost = () => {
    navigate(`/dashboard/public-journals/${_id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(`/api/post/${_id}`);
      if (res.data.success) {
        deletePostFromArray(_id);
        alert(res.data.msg);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete the post.");
    }
  };

  return (
    <Card
      key={_id}
      style={{
        cursor: "pointer",
        backgroundColor: moodColor || "#f8f9fa",
        color:"black",
      }}
      className="mb-2 post-card-view"
    >
      <Card.Header style={{ display: "flex", justifyContent: "space-between" }}>
        {formatDate(date)}
        {isPrivate && <FaTrashAlt onClick={handleDelete} />}
      </Card.Header>

      <Card.Body onClick={openPost}>
        <Card.Title>
          {moodEmoji && <span>{moodEmoji} </span>}
          {title}
        </Card.Title>
        <Card.Text>{content.slice(0, 100)}...</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PostCardView;
