export default function FacultyAttendancePage() {
  const classes = [
    {
      id: 1,
      subject: "DBMS",
      branch: "B.Tech",
      semester: 3,
      section: "A",
      time: "10:00 - 11:00",
      students: [
        { id: 1, name: "Rohan", roll: "BT23CS001", present: true },
        { id: 2, name: "Priya", roll: "BT23CS002", present: true },
        { id: 3, name: "Mohit", roll: "BT23CS003", present: false },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Faculty Attendance Dashboard</h1>

        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex flex-wrap justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">{cls.subject}</h2>
                <p className="text-gray-600">
                  {cls.branch} • Sem {cls.semester} • Section {cls.section}
                </p>
              </div>
              <div className="text-sm text-gray-500">{cls.time}</div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {cls.students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="p-3">{student.roll}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">
                      <select
                        defaultValue={student.present ? "Present" : "Absent"}
                        className="border rounded-lg px-3 py-2"
                      >
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Late</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="mt-4 px-5 py-2 rounded-xl bg-black text-white hover:opacity-90">
              Save Attendance
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
