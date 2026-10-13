// Auto-generated JS Classes for bus_map database

class Bus {
  constructor({ bus_id, license_plate, capacity, default_route_id, status, departure_status, registry }) {
    this.bus_id = bus_id;
    this.license_plate = license_plate;
    this.capacity = capacity;
    this.default_route_id = default_route_id;
    this.status = status;
    this.departure_status = departure_status;
    this.registry = registry;
  }
}

class BusLocation {
  constructor({ location_id, bus_id, latitude, longitude, vi_tri_text, timestamp, is_latest, nearest_stop_id }) {
    this.location_id = location_id;
    this.bus_id = bus_id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.vi_tri_text = vi_tri_text;
    this.timestamp = timestamp;
    this.is_latest = is_latest;
    this.nearest_stop_id = nearest_stop_id;
  }
}

class BusSchedule {
  constructor({ schedule_id, route_id, bus_id, driver_id, schedule_date, start_time, end_time }) {
    this.schedule_id = schedule_id;
    this.route_id = route_id;
    this.bus_id = bus_id;
    this.driver_id = driver_id;
    this.schedule_date = schedule_date;
    this.start_time = start_time;
    this.end_time = end_time;
  }
}

class BusStatusHistory {
  constructor({ id, bus_id, status, updated_at }) {
    this.id = id;
    this.bus_id = bus_id;
    this.status = status;
    this.updated_at = updated_at;
  }
}

class BusStop {
  constructor({ stop_id, route_id, stop_name, address, stop_order }) {
    this.stop_id = stop_id;
    this.route_id = route_id;
    this.stop_name = stop_name;
    this.address = address;
    this.stop_order = stop_order;
  }
}

class Driver {
  constructor({ driver_id, user_id, name, phone, address, email, dob, gender, id_card, rating, status, license_class, work_schedule, profile_image, created_at }) {
    this.driver_id = driver_id;
    this.user_id = user_id;
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.email = email;
    this.dob = dob;
    this.gender = gender;
    this.id_card = id_card;
    this.rating = rating;
    this.status = status;
    this.license_class = license_class;
    this.work_schedule = work_schedule;
    this.profile_image = profile_image;
    this.created_at = created_at;
  }
}

class Notification {
  constructor({ id, recipient_type, title, content, type, scheduled_time, is_recurring, recurrence_days, status_sent, created_at, status }) {
    this.id = id;
    this.recipient_type = recipient_type;
    this.title = title;
    this.content = content;
    this.type = type;
    this.scheduled_time = scheduled_time;
    this.is_recurring = is_recurring;
    this.recurrence_days = recurrence_days;
    this.status_sent = status_sent;
    this.created_at = created_at;
    this.status = status;
  }
}

class NotificationRecipients {
  constructor({ id, notification_id, recipient_id, recipient_type, status, created_at }) {
    this.id = id;
    this.notification_id = notification_id;
    this.recipient_id = recipient_id;
    this.recipient_type = recipient_type;
    this.status = status;
    this.created_at = created_at;
  }
}

class Parent {
  constructor({ parent_id, user_id, name, phone, age, sex, email }) {
    this.parent_id = parent_id;
    this.user_id = user_id;
    this.name = name;
    this.phone = phone;
    this.age = age;
    this.sex = sex;
    this.email = email;
  }
}

class Route {
  constructor({ route_id, route_name, start_point, end_point, planned_start, planned_end, total_students, status, created_at }) {
    this.route_id = route_id;
    this.route_name = route_name;
    this.start_point = start_point;
    this.end_point = end_point;
    this.planned_start = planned_start;
    this.planned_end = planned_end;
    this.total_students = total_students;
    this.status = status;
    this.created_at = created_at;
  }
}

class Student {
  constructor({ student_id, parent_id, stop_id, dropoff_stop_id, name, school_name, class_name, gender }) {
    this.student_id = student_id;
    this.parent_id = parent_id;
    this.stop_id = stop_id;
    this.dropoff_stop_id = dropoff_stop_id;
    this.name = name;
    this.school_name = school_name;
    this.class_name = class_name;
    this.gender = gender;
  }
}

class StudentPickup {
  constructor({ pickup_id, student_id, driver_id, schedule_id, stop_id, pickup_time, dropoff_time, status }) {
    this.pickup_id = pickup_id;
    this.student_id = student_id;
    this.driver_id = driver_id;
    this.schedule_id = schedule_id;
    this.stop_id = stop_id;
    this.pickup_time = pickup_time;
    this.dropoff_time = dropoff_time;
    this.status = status;
  }
}

class Users {
  constructor({ user_id, username, password, role, linked_id, created_at }) {
    this.user_id = user_id;
    this.username = username;
    this.password = password;
    this.role = role;
    this.linked_id = linked_id;
    this.created_at = created_at;
  }
}

module.exports = {
  Bus,
  BusLocation,
  BusSchedule,
  BusStatusHistory,
  BusStop,
  Driver,
  Notification,
  NotificationRecipients,
  Parent,
  Route,
  Student,
  StudentPickup,
  Users,
};
