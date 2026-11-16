import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useForm } from "@/hooks/useForm";
import { formatDate } from "@/utils/format";
import { validateReview } from "@/utils/validation";
import Button from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/TextField";
import Stars from "@/components/ui/Stars";
const initialValues = { rating: "", comment: "" };
export default function ReviewsSection({ reviews, ownReviews, onAdd, onUpdate, onRemove }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const form = useForm(initialValues, validateReview);
    const [editingDate, setEditingDate] = useState(null); // null = writing a new review
    const editing = editingDate !== null;
    const ratingError = form.fieldError("rating");
    const selected = Number(form.values.rating);
    function reviewerName() {
        if (user === null)
            return "Guest";
        const full = `${user.firstName} ${user.lastName}`.trim();
        return full === "" ? user.username : full;
    }
    function startEdit(review) {
        setEditingDate(review.date);
        form.reset({ rating: String(review.rating), comment: review.comment });
    }
    function cancelEdit() {
        setEditingDate(null);
        form.reset(initialValues);
    }
    function handleRemove(review) {
        if (!window.confirm("Delete your review? This cannot be undone."))
            return;
        onRemove(review.date);
        if (editingDate === review.date)
            cancelEdit();
        toast("Review deleted");
    }
    const submit = form.handleSubmit((values) => {
        if (editingDate !== null) {
            onUpdate(editingDate, { rating: Number(values.rating), comment: values.comment.trim() });
            setEditingDate(null);
            form.reset(initialValues);
            toast("Review updated ✓");
            return;
        }
        onAdd({
            rating: Number(values.rating),
            comment: values.comment.trim(),
            date: new Date().toISOString(),
            reviewerName: reviewerName(),
        });
        form.reset();
        toast("Review added ✓");
    });
    return (<div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {reviews.length === 0 ? (<p className="text-muted">No reviews yet. Be the first to write one!</p>) : (<ul className="space-y-4">
            {reviews.map((review, i) => (<li key={`${review.date}-${review.reviewerName}-${i}`} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{review.reviewerName}</p>
                  <time dateTime={review.date} className="text-xs text-muted">
                    {formatDate(review.date)}
                  </time>
                </div>
                <div className="mt-1">
                  <Stars rating={review.rating}/>
                </div>
                <p className="mt-2 text-sm">{review.comment}</p>
                {ownReviews.includes(review) && (<div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(review)} aria-label="Edit your review">
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleRemove(review)} aria-label="Delete your review">
                      Delete
                    </Button>
                  </div>)}
              </li>))}
          </ul>)}
      </div>

      <form onSubmit={submit} noValidate className="card h-fit space-y-4 p-4" aria-label="Write a review">
        <h3 className="text-lg font-semibold">{editing ? "Edit your review" : "Write a review"}</h3>

        <fieldset>
          <legend className="mb-1 text-sm font-medium">Rating</legend>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (<button key={n} type="button" role="radio" aria-checked={selected === n} aria-label={`${n} star${n === 1 ? "" : "s"}`} onClick={() => form.setFieldValue("rating", String(n))} className={`inline-flex size-11 items-center justify-center rounded-lg text-2xl transition-colors hover:bg-surface-2 focus-ring ${n <= selected ? "text-warn" : "text-muted/50"}`}>
                <span aria-hidden="true">★</span>
              </button>))}
          </div>
          {ratingError !== undefined && (<p role="alert" className="mt-1 text-sm text-danger">
              {ratingError}
            </p>)}
        </fieldset>

        <TextAreaField label="Comment" name="comment" rows={4} value={form.values.comment} onChange={form.handleChange} onBlur={form.handleBlur} error={form.fieldError("comment")} placeholder="What did you like or dislike?"/>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {editing ? "Save changes" : "Submit review"}
          </Button>
          {editing && (<Button variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>)}
        </div>
      </form>
    </div>);
}
