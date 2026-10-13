import TempStudent from "./component/Student";
import Style from "./../styleMain.module.css";
import React, { useRef,useEffect, useState, useMemo } from "react";
import "./style.css";
import "./../searchbar.css";
import { Student,defaultStudents } from "../../../models/Student";
import Detail_Student from "./component/formdetails/Detail_Student";
import AddStudent from "./component/addStudent";

function renderStudentsTable(students, onDetails) {
  return(students.length > 0 ? (
          students.map((student) => (
            <TempStudent 
              key={student.student_id}
              Tempstudent={student}
              onDetails={onDetails}
            />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <p>Không tìm thấy học sinh phù hợp</p>
          </div>
        ));
}
function StudentManagementPage() {
  const [students, setStudents] = useState([]);
  const [showaddstudent, setShowAddStudent] = useState(false);
  const [filter, setFilter] = useState('all'); // filter by route
  const [searchQuery, setSearchQuery] = useState(''); // search by name
  const [pagestudent, setPageStudent] = useState({}); // page state: default, detail
  const boxRef = useRef(null);

  const showgrid = () => {
    boxRef.current.style.display = "grid";
  };
  const showdetail = () => {
    boxRef.current.style.display = "flex";
  }
  useEffect(() => {
    // ví dụ: lấy từ API hoặc dữ liệu tĩnh
    
    setStudents(defaultStudents);
    setPageStudent({key: "default", value: null});
  }, []);

  // filter + search logic
  const filteredStudents = useMemo(() => {
    let result = students;

    // filter by route
    if (filter !== 'all') {
      result = result.filter(s => s.route_id === filter);
    }

    // search by name or id
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.full_name.toLowerCase().includes(q) || 
        s.student_id.includes(q)
      );
    }

    return result;
  }, [students, filter, searchQuery]);
  function showDefaultPage(){

    return (
      <>
      <header style={{width:"100%"}}>
        <div className={Style.row_direction} style={{justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className={Style.setTitle_h1}><i className="fas fa-users" /> Quản Lý Học Sinh</h1>
            <p className="description">Quản lý và theo dõi danh sách học sinh đi xe buýt</p>
          </div>
          <div>
            <button style={{ color: "white" }} onClick={()=>handleAddStudent(true)}>➕ Thêm Học Sinh</button>
          </div>
        </div>
      </header>

      {/* Dashboard cards */}
      

      {/* Search + Filter */}
      <div className={"row-container-searchbar " + Style.row_direction}>
        <div className="search-container">
          <i className="fas fa-search" />
          <input 
            style={{ fontSize: "1.1em" }} 
            type="text" 
            className="search-box" 
            placeholder="Tìm kiếm học sinh (tên hoặc mã)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-container">
          <i className="fas fa-filter" />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả tuyến xe</option>
            <option value="Tuyến 1">Tuyến 1</option>
            <option value="Tuyến 2">Tuyến 2</option>
            <option value="Tuyến 3">Tuyến 3</option>
            <option value="Tuyến 4">Tuyến 4</option>
          </select>
        </div>
      </div>

      {/* Card Grid - renders filtered students dynamically */}
      <div className="card-grid" ref={boxRef}>
        {handleSwitchPage()}
      </div>
      </>
    )
  }
  function handleSwitchPage(){
    switch(pagestudent.key){
      case "detail":
        return <Detail_Student tempStudent={pagestudent.value} backToList={goBackToList}/>;
      default:
        return renderStudentsTable(filteredStudents, handleStudentDetails);
    }
  }
  // helper functions

  const handleAddStudent = (bool) => {
    setShowAddStudent(bool);
  };
  

  const handleStudentDetails = (student) => {
    showdetail()
    setPageStudent({key: "detail", value: student});
    console.log('View details for student', pagestudent);
  };
  const goBackToList = () => {
    showgrid()
    setPageStudent({key: "default", value: null});
  }
  return (
    <div className={Style.content_main_center + " " + Style.column_direction}>
      {/* Header */}
      {!showaddstudent && showDefaultPage()}
      {showaddstudent && <>
      <AddStudent onClose={handleAddStudent}/>
      </>}
    </div>
  );
}

export default StudentManagementPage;