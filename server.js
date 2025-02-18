const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require("multer");
const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://sukanth:sukanth0021@cluster0.qknti.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

    const labSchema = new mongoose.Schema({
        labName: String,
        description: String,
        image: Buffer
    });
    
    const Lab = mongoose.model("Lab", labSchema);
    
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });
    

// Define faculty schema and model
const facultySchema = new mongoose.Schema({
    name: String,
    position: String,
    specialization: String,
    email: String,
    publications: {
        type: [String],
        validate: {
            validator: function(arr) {
                return arr.length > 0;
            },
            message: 'At least one publication is required.'
        }
    },
    image: Buffer
});

const FacultyDetails = mongoose.model('FacultyDetails', facultySchema);

const patentDetailsSchema = new mongoose.Schema({
    name: String,
    title: String,
    patentNo: String,
    status: String
});

const PatentDetails = mongoose.model('PatentDetail', patentDetailsSchema);

const programmeSchema = new mongoose.Schema({
    name: String,
    description: String
});

const Programme = mongoose.model('Programmes', programmeSchema);

const Vision = mongoose.model('Vision', new mongoose.Schema({
    vision: { type: String, required: true }
}));

const Mission = mongoose.model('Mission', new mongoose.Schema({
    mission: { type: String, required: true }
}));

const highlightSchema = new mongoose.Schema({
    highlights: String,
  });
  
  // Create a model for the "ithighlights" collection
  const Highlight = mongoose.model('ithighlights', highlightSchema);

  const peoSchema = new mongoose.Schema({
    peo: String,
});

const PEOModel = mongoose.model('PEO', peoSchema, 'peos');

// PO Schema and Model
const poSchema = new mongoose.Schema({
    po: String,
});

const POModel = mongoose.model('PO', poSchema, 'pos');

// PSO Schema and Model
const psoSchema = new mongoose.Schema({
    pso: String,
});

const PSOModel = mongoose.model('PSO', psoSchema, 'psos');

// Define HOD schema and model
const hodSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    position: String,
    image:Buffer
});

const HODDetails = mongoose.model('HODDetails', hodSchema);

const milestoneSchema = new mongoose.Schema({
    year: { type: Number, required: true },
    milestone: { type: String, required: true },
});

const Milestone = mongoose.model('Milestone', milestoneSchema, 'milestones');

const libDetailsSchema = new mongoose.Schema({
    totalArea: String,
    noOfVolumes: String,
    noOfTitles: String,
    noOfReportCD: String,
    valueOfBooks: String,
    noOfJournals: String,
    valueOfJournals: String,
    workingHours: String,
    image: {
        data: Buffer, // Binary data for image
        contentType: String
    }
});

const LibDetails = mongoose.model('LibDetails', libDetailsSchema);

app.put('/updateLib', upload.single('image'), async (req, res) => {
    try {
        const { id, totalArea, noOfVolumes, noOfTitles, noOfReportCD, valueOfBooks, noOfJournals, valueOfJournals, workingHours } = req.body;
        const updateData = {
            totalArea,
            noOfVolumes,
            noOfTitles,
            noOfReportCD,
            valueOfBooks,
            noOfJournals,
            valueOfJournals,
            workingHours
        };

        if (req.file) {
            const image = {
                data: fs.readFileSync(path.join(__dirname, 'uploads', req.file.filename)),
                contentType: req.file.mimetype
            };
            updateData.image = image;
        }

        const updatedLib = await LibDetails.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedLib) {
            return res.status(404).json({ error: 'Library not found' });
        }

        res.status(200).json(updatedLib);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to fetch all lab details
app.get('/getLibDetails', async (req, res) => {
    try {
        const labs = await LibDetails.find();
        // Convert image data to base64 before sending it to the frontend
        const labsWithBase64Images = labs.map(lab => ({
            ...lab.toObject(),
            image: {
                data: lab.image.data.toString('base64'),
                contentType: lab.image.contentType
            }
        }));
        res.json(labsWithBase64Images);
    } catch (err) {
        console.error('Error fetching lab details:', err);
        res.status(500).json({ error: 'Failed to fetch lab details' });
    }
});
app.get("/getLibDetail", async (req, res) => {
    try {
        const libDetails = await LibDetails.findOne({}); // Fetch the first library document

        if (!libDetails) {
            return res.status(404).json({ error: "Library details not found" });
        }

        const formattedLibDetails = {
            totalArea: libDetails.totalArea,
            noOfVolumes: libDetails.noOfVolumes,
            noOfTitles: libDetails.noOfTitles,
            noOfReportCD: libDetails.noOfReportCD,
            valueOfBooks: libDetails.valueOfBooks,
            noOfJournals: libDetails.noOfJournals,
            valueOfJournals: libDetails.valueOfJournals,
            workingHours: libDetails.workingHours,
            image: libDetails.image?.data
                ? {
                    data: libDetails.image.data.toString("base64"),
                    contentType: libDetails.image.contentType
                }
                : null
        };

        res.status(200).json(formattedLibDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/getLibDetails/:id', async (req, res) => {
    try {
        const lib = await LibDetails.findById(req.params.id);
        if (!lib) {
            return res.status(404).json({ error: 'Library not found' });
        }
        res.status(200).json(lib);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post("/addLab", upload.single("image"), async (req, res) => {
    try {
        const newLab = new Lab({
            labName: req.body.labName,
            description: req.body.description,
            image: req.file.buffer
        });
        await newLab.save();
        res.status(201).json({ message: "Lab added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all labs
app.get("/getLabs", async (req, res) => {
    try {
        const labs = await Lab.find();
const formattedLabs = labs.map(lab => ({
    _id: lab._id,
    labName: lab.labName,
    description: lab.description,
    image: lab.image ? lab.image.toString("base64") : null
}));

res.status(200).json(formattedLabs);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/getLabs/:id', async (req, res) => {
    try {
        const lab = await Lab.findById(req.params.id);
        if (!lab) {
            return res.status(404).json({ error: 'Lab not found' });
        }
        res.status(200).json(lab);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a lab
app.put("/updateLab", upload.single("image"), async (req, res) => {
    try {
        const {id,labName,description}=req.body
        const updateData = {
            labName: req.body.labName,
            description: req.body.description,
        };
        if (req.file) updateData.image = req.file.buffer;
        await Lab.findByIdAndUpdate(id, updateData);
        res.status(200).json({ message: "Lab updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a lab
app.delete("/deleteLab/:id", async (req, res) => {
    try {
        await Lab.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Lab deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/peos', async (req, res) => {
    try {
        const peos = await PEOModel.find();
        res.json(peos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/peo', async (req, res) => {
    const { peo } = req.body;
    const newPEO = new PEOModel({ peo });

    try {
        const savedPEO = await newPEO.save();
        res.status(201).json(savedPEO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/peo/:id', async (req, res) => {
    const { id } = req.params;
    const { peo } = req.body;

    try {
        const updatedPEO = await PEOModel.findByIdAndUpdate(id, { peo }, { new: true });
        res.json(updatedPEO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/peo/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await PEOModel.findByIdAndDelete(id);
        res.json({ message: 'PEO deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Routes for POs
app.get('/api/pos', async (req, res) => {
    try {
        const pos = await POModel.find();
        res.json(pos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/po', async (req, res) => {
    const { po } = req.body;
    const newPO = new POModel({ po });

    try {
        const savedPO = await newPO.save();
        res.status(201).json(savedPO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/po/:id', async (req, res) => {
    const { id } = req.params;
    const { po } = req.body;

    try {
        const updatedPO = await POModel.findByIdAndUpdate(id, { po }, { new: true });
        res.json(updatedPO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/po/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await POModel.findByIdAndDelete(id);
        res.json({ message: 'PO deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Routes for PSOs
app.get('/api/psos', async (req, res) => {
    try {
        const psos = await PSOModel.find();
        res.json(psos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/pso', async (req, res) => {
    const { pso } = req.body;
    const newPSO = new PSOModel({ pso });

    try {
        const savedPSO = await newPSO.save();
        res.status(201).json(savedPSO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/pso/:id', async (req, res) => {
    const { id } = req.params;
    const { pso } = req.body;

    try {
        const updatedPSO = await PSOModel.findByIdAndUpdate(id, { pso }, { new: true });
        res.json(updatedPSO);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/pso/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await PSOModel.findByIdAndDelete(id);
        res.json({ message: 'PSO deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/vision', async (req, res) => {
    try {
        const vision = new Vision({ vision: req.body.vision });
        await vision.save();
        res.status(201).json(vision);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create new Mission
app.post('/api/mission', async (req, res) => {
    try {
        const mission = new Mission({ mission: req.body.mission });
        await mission.save();
        res.status(201).json(mission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch all Vision records
app.get('/api/visions', async (req, res) => {
    try {
        const visions = await Vision.find();
        res.status(200).json(visions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch all Mission records
app.get('/api/missions', async (req, res) => {
    try {
        const missions = await Mission.find();
        res.status(200).json(missions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Vision by ID
app.put('/api/vision/:id', async (req, res) => {
    try {
        const vision = await Vision.findByIdAndUpdate(req.params.id, { vision: req.body.vision }, { new: true });
        if (!vision) {
            return res.status(404).json({ message: 'Vision not found' });
        }
        res.status(200).json(vision);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update Mission by ID
app.put('/api/mission/:id', async (req, res) => {
    try {
        const mission = await Mission.findByIdAndUpdate(req.params.id, { mission: req.body.mission }, { new: true });
        if (!mission) {
            return res.status(404).json({ message: 'Mission not found' });
        }
        res.status(200).json(mission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Vision by ID
app.delete('/api/vision/:id', async (req, res) => {
    try {
        const vision = await Vision.findByIdAndDelete(req.params.id);
        if (!vision) {
            return res.status(404).json({ message: 'Vision not found' });
        }
        res.status(200).json({ message: 'Vision deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Mission by ID
app.delete('/api/mission/:id', async (req, res) => {
    try {
        const mission = await Mission.findByIdAndDelete(req.params.id);
        if (!mission) {
            return res.status(404).json({ message: 'Mission not found' });
        }
        res.status(200).json({ message: 'Mission deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/programmes', async (req, res) => {
    try {
        const programmes = await Programme.find();
        res.json(programmes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching programmes' });
    }
});

// Add a new programme
app.post('/api/programmes', async (req, res) => {
    const { name, description } = req.body;

    const newProgramme = new Programme({ name, description });

    try {
        await newProgramme.save();
        res.status(201).json(newProgramme);
    } catch (err) {
        res.status(500).json({ message: 'Error adding programme' });
    }
});
app.get('/api/programmes/:id', async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }
        res.json(programme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Update a programme
app.put('/api/programmes/:id', async (req, res) => {
    const { name, description } = req.body;

    try {
        const updatedProgramme = await Programme.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        res.json(updatedProgramme);
    } catch (err) {
        res.status(500).json({ message: 'Error updating programme' });
    }
});

// Delete a programme
app.delete('/api/programmes/:id', async (req, res) => {
    try {
        await Programme.findByIdAndDelete(req.params.id);
        res.json({ message: 'Programme deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting programme' });
    }
});

app.post('/api/milestones', async (req, res) => {
    try {
        const { year, milestone } = req.body;
        const newMilestone = new Milestone({ year, milestone });
        await newMilestone.save();
        res.status(201).json(newMilestone);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create milestone' });
    }
});

// Fetch all milestones
app.get('/api/milestones', async (req, res) => {
    try {
        const milestones = await Milestone.find();
        res.status(200).json(milestones);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch milestones' });
    }
});

// Update a milestone by ID
app.put('/api/milestones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { year, milestone } = req.body;
        const updatedMilestone = await Milestone.findByIdAndUpdate(
            id,
            { year, milestone },
            { new: true }
        );
        if (!updatedMilestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }
        res.status(200).json(updatedMilestone);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update milestone' });
    }
});

// Delete a milestone by ID
app.delete('/api/milestones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMilestone = await Milestone.findByIdAndDelete(id);
        if (!deletedMilestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }
        res.status(200).json({ message: 'Milestone deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete milestone' });
    }
});

app.post('/api/patentdetails', async (req, res) => {
    const { name, title, patentNo, status } = req.body;
    try {
        const newPatentDetail = new PatentDetails({
            name,
            title,
            patentNo,
            status
        });
        await newPatentDetail.save();
        res.status(201).send('Patent detail added successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get all patent details
app.get('/api/patentdetails', async (req, res) => {
    try {
        const patentDetails = await PatentDetails.find();
        res.json(patentDetails);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update a patent detail by ID
app.put('/api/patentdetails/:id', async (req, res) => {
    const { name, title, patentNo, status } = req.body;
    try {
        await PatentDetails.findByIdAndUpdate(req.params.id, {
            name,
            title,
            patentNo,
            status
        });
        res.send('Patent detail updated successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a patent detail by ID
app.delete('/api/patentdetails/:id', async (req, res) => {
    try {
        await PatentDetails.findByIdAndDelete(req.params.id);
        res.send('Patent detail deleted successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET: Fetch all highlights
app.get('/api/highlights', async (req, res) => {
    try {
      const highlights = await Highlight.find();
      // Check the returned data for debugging
      res.json({ highlights });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching highlights' });
    }
  });
  

  app.put('/api/highlights/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
      const highlight = await Highlight.findByIdAndUpdate(id, { highlights: text }, { new: true });
      if (!highlight) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      res.json({ success: true, message: 'Highlight updated successfully!', highlight });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating highlight' });
    }
  });

  app.delete('/api/highlights/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const highlight = await Highlight.findByIdAndDelete(id);
      if (!highlight) {
        return res.status(404).json({ message: 'Highlight not found' });
      }
      res.json({ success: true, message: 'Highlight deleted successfully!' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error deleting highlight' });
    }
  });

app.post('/api/highlights', async (req, res) => {
    const { highlights } = req.body;
  
    try {
      const newHighlight = new Highlight({ highlights });
      await newHighlight.save();
      res.json({ success: true });
    } catch (err) {
      console.log('Error saving highlight:', err);
      res.json({ success: false });
    }
  });
  
// Route to handle HOD details submission
app.post('/submit-hod', async (req, res) => {
    try {
        const { name, email, phone, position } = req.body;

        const newHOD = new HODDetails({
            name,
            email,
            phone,
            position
        });

        await newHOD.save();
        res.status(201).send('HOD details saved successfully!');
    } catch (error) {
        res.status(500).send('Error saving HOD details: ' + error.message);
    }
});

// Route to handle faculty form submission
app.post('/submit', upload.single('image'), async (req, res) => {
    try {
        const { name, position, specialization, email, publications } = req.body;
        const imagePath = req.file.buffer;

        const newFaculty = new FacultyDetails({
            name,
            position,
            specialization,
            email,
            publications: Array.isArray(publications) ? publications : [publications],
            image: imagePath
        });

        await newFaculty.save();
        res.status(201).send('Faculty details saved successfully!');
    } catch (error) {
        res.status(500).send('Error saving faculty details: ' + error.message);
    }
});

// API to fetch faculty data
app.get('/api/faculty', async (req, res) => {
    try {
        const faculty = await FacultyDetails.find({});
        const formattedFaculty = faculty.map(faculty => ({
            _id: faculty._id,
            name: faculty.name,
            position: faculty.position,
            specialization: faculty.specialization,
            email: faculty.email,
            publications: faculty.publications,
            image: faculty.image ? faculty.image.toString("base64") : null
        }));

        res.json(formattedFaculty);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching faculty data' });
    }
});


// API to delete a faculty member by ID
app.delete('/api/faculty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await FacultyDetails.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Faculty member not found' });
        }
        res.json({ message: 'Faculty member deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting faculty data' });
    }
});

// API to update faculty member data by ID
app.put('/api/faculty/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFaculty = req.body;
        if (req.file) {
            updatedFaculty.image = req.file.buffer;
        }

        const result = await FacultyDetails.findByIdAndUpdate(id, updatedFaculty, { new: true });
        if (!result) {
            return res.status(404).json({ message: 'Faculty member not found' });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error updating faculty data' });
    }
});

// API to fetch HOD details
app.get('/api/hod', async (req, res) => {
    try {
        const hod = await HODDetails.findOne({});
        if (!hod) {
            return res.status(404).json({ message: 'HOD details not found' });
        }
        
        const formattedHOD = {
            _id: hod._id,
            name: hod.name,
            email: hod.email,
            position: hod.position,
            phone: hod.phone,
            image: hod.image ? hod.image.toString("base64") : null
        };

        res.status(200).json(formattedHOD);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching HOD data', error: error.message });
    }
});


// API to update HOD details
app.put('/api/hod', upload.single('image'), async (req, res) => {
    try {
        const { name, email, phone, position } = req.body;
        const imageUrl = req.file ? req.file.buffer : null; // Get the uploaded image buffer

        const updatedHOD = {
            name,
            email,
            phone,
            position,
            image:imageUrl // Include the new image
        };

        // Update the HOD details in the database
        await HODDetails.findOneAndUpdate({}, updatedHOD, { upsert: true });
        res.status(200).json({ message: 'HOD details updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating HOD details', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
