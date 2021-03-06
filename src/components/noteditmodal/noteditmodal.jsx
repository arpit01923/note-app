import "./noteditmodal.css";
import { quillModules, color } from "staticdata";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getNote, isNewTag } from "utils";
import { useNote } from "context";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { BsPinAngle, BsPin } from "react-icons/bs";
import { IoColorPalette } from "react-icons/io5";

export const NoteEditModal = ({
  noteDispatch,
  noteState,
  noteId,
  setShowTags,
  showTags,
  tags,
  setShowEditContainer,
  token,
}) => {
  const { noteArrayState, noteArrayDispatch } = useNote();
  const note = getNote(noteId, noteArrayState.notes);
  const [showColor, setShowColor] = useState(false);
  const [pin, setPin] = useState(note.pinned);

  useEffect(() => {
    noteDispatch({ type: "SET_NOTE_BEFORE_EDIT", payload: note });
  }, [note]);

  const tagsPopup = () => {
    setShowTags((prev) => !prev);
  };

  const deleteTag = (tag) => {
    noteDispatch({
      type: "DELETE_TAG",
      payload: tag,
    });
  };

  const addTag = (tag) => {
    const newTag = isNewTag(noteState.tags, tag);
    if (!newTag) {
      noteDispatch({
        type: "ADD_TAG",
        payload: tag,
      });
    } else {
      console.log("Tag is already present");
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `/api/notes/${noteId}`,
        { note: noteState },
        {
          headers: {
            authorization: token,
          },
        }
      );
      noteArrayDispatch({ type: "UPDATE_NOTES", payload: response.data.notes });
      setShowEditContainer(false);
      noteDispatch({ type: "RESET" });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className="edit-container">
      <form className="add-note">
        {!pin ? (
          <BsPinAngle
            className="cursor-pointer fa-map-pin"
            title="pinned"
            onClick={() => {
              noteDispatch({ type: "PINNED", payload: noteState.pinned });
              setPin(true);
            }}
          />
        ) : (
          <BsPin
            className="cursor-pointer fa-map-pin"
            title="unpinned"
            onClick={() => {
              noteDispatch({ type: "UNPINNED", payload: noteState.pinned });
              setPin(false);
            }}
          />
        )}
        <input
          style={{ backgroundColor: noteState.color }}
          className="title"
          placeholder="Title"
          value={noteState.title}
          onChange={(event) =>
            noteDispatch({ type: "TITLE", payload: event.target.value })
          }
        />
        <ReactQuill
          style={{ backgroundColor: noteState.color }}
          placeholder="Take a note..."
          theme="snow"
          modules={quillModules}
          value={noteState.text}
          onChange={(event) => noteDispatch({ type: "TEXT", payload: event })}
        />
        <div
          style={{ backgroundColor: noteState.color }}
          className="cursor-pointer tag-container"
          onClick={() => tagsPopup()}
        >
          {noteState.tags.length !== 0 ? (
            noteState.tags.map((tag, index) => (
              <span className="tag" key={index}>
                {tag}
                <i className="fas fa-times" onClick={() => deleteTag(tag)}></i>
              </span>
            ))
          ) : (
            <span>Add tags</span>
          )}
        </div>
        {showTags && (
          <section name="tags" className="select">
            <AiOutlineClose
              className="cursor-pointer close"
              onClick={() => tagsPopup()}
            />
            {tags.map((tag, index) => (
              <div
                key={index}
                className="cursor-pointer options"
                onClick={() => addTag(tag)}
              >
                {tag}
              </div>
            ))}
          </section>
        )}
        <IoColorPalette
          className="color-pallete-icon"
          onClick={() => setShowColor((prev) => !prev)}
        />
        {showColor && (
          <section className="color-pallete">
            {color.map((item, index) => (
              <div
                className="cursor-pointer color-selector"
                key={index}
                onClick={() => noteDispatch({ type: "COLOR", payload: item })}
                style={{ backgroundColor: item }}
              ></div>
            ))}
          </section>
        )}
        <button
          className="cursor-pointer save-note"
          onClick={(event) => updateHandler(event)}
        >
          Update note
        </button>
      </form>
    </main>
  );
};
