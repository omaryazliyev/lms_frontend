"use client";
import React from "react";

const reviews = [
  {
    id: 1,
    text: "Lorem ipsum dolor sit amet consectetur. Sit in eget posuere facilisis elementum. Est semper aenean erat est etiam sit. Auctor risus semper ultrices eleifend vel at. Pharetra turpis fames cursus sit in faucibus.",
    author: "Xurshid Istamov",
    role: "Frontend kursi o'quvchisi"
  },
  {
    id: 2,
    text: "Lorem ipsum dolor sit amet consectetur. In mattis ullamcorper faucibus amet libero. Et varius lorem magna non ultrices dictum duis. Quis imperdiet parturient leo orci libero gravida. Tortor malesuada quam.",
    author: "Xurshid Istamov",
    role: "Frontend kursi o'quvchisi"
  },
  {
    id: 3,
    text: "Lorem ipsum dolor sit amet consectetur. Lectus placerat convallis vel mauris. Donec nunc tincidunt mattis enim rhoncus viverra libero enim nulla. Faucibus eleifend commodo sollicitudin eu turpis risus vitae.",
    author: "Xurshid Istamov",
    role: "Frontend kursi o'quvchisi"
  }
];

export default function ReviewsSection() {
  return (
    <section style={{ padding: "80px 80px", background: "#fff" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
          Izohlar
        </h2>
        <p style={{ fontSize: 15, color: "#64748b" }}>
          O&apos;quvchilarimiz tomonidan qoldirilgan izohlar
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              background: "#fff",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            {/* Quote icon */}
            <div style={{ fontSize: 48, lineHeight: 1, color: "#f97316", fontFamily: "Georgia, serif", marginBottom: -8 }}>
              &#x275D;
            </div>

            {/* Review text */}
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0, flex: 1 }}>
              {review.text}
            </p>

            {/* Author */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{review.author}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{review.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
