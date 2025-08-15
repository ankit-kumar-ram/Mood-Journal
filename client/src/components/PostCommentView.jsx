import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import formatDate from "../utils/formatDate";

const PostCommentView = ({ postId, refreshSignal }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!postId) {
          setError("Invalid post ID.");
          return;
        }

        setLoading(true);
        const res = await axios.get(`/api/comment/post/${postId}`);

        if (Array.isArray(res.data)) {
          setComments(res.data);
          setError("");
        } else {
          setComments([]);
          setError("Unexpected data format.");
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to fetch comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, refreshSignal]);

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await axios.delete(`/api/comment/delete/${commentId}`);
      if (res.status === 200) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        alert("Comment deleted.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    }
  };

  if (loading) return <p><strong>Loading comments...</strong></p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (comments.length === 0) return <p>No comments yet.</p>;

  return (
    <div>
      <h5>Comments</h5>
      {comments.map(({ _id, content, createdAt, author }) => (
        <div
          key={_id}
          style={{
            border: "1px solid #ddd",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "6px",
          }}
        >
          <p>{content}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "#555",
            }}
          >
            <span>By: {author?.name || "Anonymous"}</span>
            <span>{formatDate(createdAt)}</span>
            <FaTrashAlt
              style={{ cursor: "pointer", color: "red" }}
              title="Delete comment"
              onClick={() => handleDeleteComment(_id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostCommentView;
