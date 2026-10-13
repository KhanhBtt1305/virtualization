import studentAPI from "../api/studentAPI"
import { Student } from "../models/bus_mapDB"
const renderStudent = {
    
    getAllStudents: ()=>{
        const arrays = []
        studentAPI.getAllStudents().then(res=> res.data.data.map(item=> arrays.push(new Student(item))))
        return arrays
    }
}
export default renderStudent