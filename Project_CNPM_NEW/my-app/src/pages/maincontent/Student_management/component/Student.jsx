// PassengerCard.jsx
import React from 'react';
import './styleComponent.css';

const defaultStudent = {
  student_id: '001',
  full_name: 'Nguyễn Văn A',
  route_id: 'Tuyến số: 1',
  home_address: '45 Hồng Bàng',
  pickupTime: '6:55',
  avatarUrl: null,
};

const PassengerCard = ({ Tempstudent = defaultStudent, onDetails = () => {} }) => {
  const { student_id, full_name, route_id, home_address, pickupTime="6:55", avatarUrl } = Tempstudent;

  return (
    <article className="passenger-card">
      <header className="passenger-card__header">
        <span className="passenger-card__id">ID: {student_id}</span>
      </header>

      <div className="passenger-card__avatar-wrap">
        <div className="passenger-card__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${full_name} avatar`} />
          ) : (
            <div className="passenger-card__avatar-fallback">
              {full_name ? full_name.charAt(0).toUpperCase() : 'A'}
            </div>
          )}
        </div>
      </div>

      <div className="passenger-card__body">
        <h2 className="passenger-card__name">{full_name}</h2>

        <div className="passenger-card__info">
          <div className="info-row">
            <span className="info-icon">🚌</span>
            <span className="info-text">{route_id}</span>
          </div>

          <div className="info-row">
            <span className="info-icon">📍</span>
            <span className="info-text">{home_address}</span>
          </div>

          <div className="info-row">
            <span className="info-icon">⏱️</span>
            <span className="info-text">{pickupTime}</span>
          </div>
        </div>

        <div className="passenger-card__actions">
          <button className="btn btn--primary" onClick={() => onDetails(Tempstudent)}>Xem chi tiết</button>
        </div>
      </div>
    </article>
  );
};

export default PassengerCard;